import { test as base, expect, type Locator, type Page, type Request } from '@playwright/test';
import { CoverageReport } from 'monocart-coverage-reports';
import fs from 'node:fs';
import path from 'node:path';
import {
	EXTERNAL_URL_RE,
	FIXED_NOW,
	isLatestRasterRequest,
	latestRasterResponse,
	RECORD,
	RECORDING_TMP_DIR,
	ROOT_DIR,
	UPSTREAM_HAR
} from '../../support/constants.mjs';
import { e2eClientCoverageOptions } from '../../support/coverage-options.mjs';

type TestOptions = {
	/** keep the welcome tour closed (it opens on the first visit otherwise) */
	skipWelcomeTour: boolean;
	/** collect V8 coverage (chromium only); off for pages that are expected to freeze */
	collectCoverage: boolean;
	/**
	 * upstream requests that may be missing from the recording because the app issues them
	 * timing dependent; they are answered with 503 instead of failing the test. Use sparingly.
	 */
	allowUnrecorded: RegExp | null;
};

type TestFixtures = {
	/** blocks/records/replays all upstream traffic of the test (auto) */
	network: { violations: string[] };
	/** collects V8 coverage in chromium (auto) */
	coverage: void;
};

const slug = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

const isLocal = (url: URL) => url.hostname === 'localhost' || url.hostname === '127.0.0.1';

export const test = base.extend<TestOptions & TestFixtures>({
	skipWelcomeTour: [true, { option: true }],
	collectCoverage: [true, { option: true }],
	allowUnrecorded: [null, { option: true }],

	network: [
		async ({ context, allowUnrecorded }, use, testInfo) => {
			const violations: string[] = [];

			// lowest priority: everything that is neither local nor answered by the recording
			await context.route(
				(url) => !isLocal(url) && url.protocol.startsWith('http'),
				async (route) => {
					const url = route.request().url();
					// when recording, routeFromHAR only listens passively, so let upstreams through
					if (RECORD && EXTERNAL_URL_RE.test(url)) return route.continue();
					if (allowUnrecorded?.test(url)) return route.fulfill({ status: 503 });
					violations.push(
						EXTERNAL_URL_RE.test(url)
							? `unrecorded request ${route.request().method()} ${url} – run \`pnpm test:e2e:record\``
							: `request to unexpected host ${url} – add it to EXTERNAL_HOSTS or block it`
					);
					await route.abort('blockedbyclient');
				}
			);

			if (RECORD) {
				// each test records into its own HAR; global-teardown merges them into UPSTREAM_HAR
				const spec = slug(path.relative(path.join(ROOT_DIR, 'tests/e2e'), testInfo.file));
				const title = slug(testInfo.titlePath.slice(1).join(' '));
				await context.routeFromHAR(
					path.join(RECORDING_TMP_DIR, testInfo.project.name, `${spec}__${title}.har`),
					{ url: EXTERNAL_URL_RE, update: true, updateContent: 'embed', updateMode: 'minimal' }
				);
			} else if (fs.existsSync(UPSTREAM_HAR)) {
				// all tests and projects replay the same recording
				await context.routeFromHAR(UPSTREAM_HAR, { url: EXTERNAL_URL_RE, notFound: 'fallback' });
			}

			// tests can still override this with their own page.route
			await context.route(isLatestRasterRequest, (route) =>
				route.fulfill({ json: latestRasterResponse(route.request().url()) })
			);

			await use({ violations });

			expect(violations, 'all upstream requests must be recorded').toEqual([]);
		},
		{ auto: true }
	],

	coverage: [
		async ({ page, browserName, collectCoverage }, use) => {
			if (browserName !== 'chromium' || !collectCoverage) return use();
			const report = new CoverageReport(e2eClientCoverageOptions);
			let pending = Promise.resolve();
			const collect = (restart: boolean) =>
				(pending = pending.then(async () => {
					const entries = await page.coverage.stopJSCoverage();
					if (entries.length) await report.add(entries);
					if (restart) await page.coverage.startJSCoverage({ resetOnNavigation: false });
				}));

			await page.coverage.startJSCoverage({ resetOnNavigation: false });
			// V8 drops the counters of a document once a full page load replaces it: collect them
			// before every goto/reload (all other navigations of the app are client side)
			for (const method of ['goto', 'reload'] as const) {
				const original = page[method].bind(page) as (...args: unknown[]) => Promise<unknown>;
				Object.assign(page, {
					[method]: async (...args: unknown[]) => {
						await collect(true);
						return original(...args);
					}
				});
			}
			await use();
			if (!page.isClosed()) await collect(false);
		},
		{ auto: true }
	],

	page: async ({ page, skipWelcomeTour }, use, testInfo) => {
		// start the clock at FIXED_NOW and let it run: a frozen Date.now() stalls time based
		// throttling (e.g. svelte-maplibre markers). Requests only use hour/day precision.
		await page.clock.install({ time: new Date(FIXED_NOW) });
		await page.clock.resume();
		if (skipWelcomeTour) {
			await page.addInitScript(() => {
				if (localStorage.getItem('welcome-opened') === null) {
					localStorage.setItem('welcome-opened', 'false');
				}
			});
		}
		const inFlight = new Set<Request>();
		page.on('request', (r) => inFlight.add(r));
		page.on('requestfinished', (r) => inFlight.delete(r));
		page.on('requestfailed', (r) => inFlight.delete(r));
		await use(page);
		// let late requests (map tiles/glyphs, debounced searches) happen before the recording is
		// closed, so that recording and replay always see the same set of requests
		if (!page.isClosed() && testInfo.status === 'passed') {
			if (await page.locator('#map').count()) {
				await waitForMapIdle(page).catch(() => {});
			}
			await waitForUrlToSettle(page);
			// HAR routing (recording: reading response bodies) breaks when the context closes while
			// requests are in flight
			await waitForNoRequestsInFlight(page, inFlight);
		}
	}
});

export { expect };

async function waitForNoRequestsInFlight(page: Page, inFlight: Set<Request>, timeoutMs = 10_000) {
	const deadline = Date.now() + timeoutMs;
	let quietSince = Date.now();
	while (Date.now() < deadline) {
		if (inFlight.size > 0) quietSince = Date.now();
		else if (Date.now() - quietSince > 300) return;
		await page.waitForTimeout(50);
	}
}

/** app URL with UI state in the query string, e.g. appUrl('/en', { unit: 'pet' }) */
export function appUrl(path: string, params: Record<string, string | number | boolean> = {}) {
	const search = new URLSearchParams(
		Object.entries(params).map(([key, value]) => [key, String(value)])
	).toString();
	return search ? `${path}?${search}` : path;
}

/**
 * page.goto + wait for hydration, so that the first interaction is not lost.
 * The LocaleSwitcher (in every header) writes `history.state.locale` from an effect.
 */
export async function open(page: Page, url: string, { waitForMap = true } = {}) {
	await page.goto(url);
	await page.waitForFunction(() => Boolean(history.state?.locale));
	// the map writes its viewport into the URL after its initial zoom (debounced), with a stale
	// copy of the query string – an interaction in between would be reverted
	if (waitForMap && (await page.locator('#map').count())) await waitForMapIdle(page);
	await waitForUrlToSettle(page);
}

/**
 * sveltekit-search-params writes the UI state into the URL with debounced (500ms) navigations,
 * which would cancel a navigation started by the test in the meantime.
 */
export async function waitForUrlToSettle(page: Page, quietMs = 800) {
	let last = page.url();
	let stableSince = Date.now();
	while (Date.now() - stableSince < quietMs) {
		await page.waitForTimeout(100);
		if (page.url() !== last) {
			last = page.url();
			stableSince = Date.now();
		}
	}
}

/**
 * opens a PopoverTooltip: a tooltip on hover devices, a popover (tap) on touch devices
 * (see src/lib/components/ui/popover-tooltip)
 */
export async function revealTooltip(trigger: Locator) {
	const isTouch = await trigger.page().evaluate(() => matchMedia('(any-hover: none)').matches);
	if (isTouch) await trigger.click();
	else await trigger.hover();
}

/** viewport position of a lng/lat on the map canvas */
export async function mapPoint(page: Page, lngLat: [number, number]) {
	const point = await page.evaluate((ll) => window.__D2R_MAP__!.project(ll), lngLat);
	const box = (await page.locator('.maplibregl-canvas').boundingBox())!;
	return { x: box.x + point.x, y: box.y + point.y };
}

/** viewport position of a station marker */
export async function stationPoint(page: Page, stationId: string) {
	const lngLat = await page.evaluate((id) => {
		const feature = window
			.__D2R_MAP__!.querySourceFeatures('stations-outer-rings')
			.find((f) => f.properties?.id === id);
		if (!feature || feature.geometry.type !== 'Point') throw new Error(`no station ${id}`);
		return feature.geometry.coordinates as [number, number];
	}, stationId);
	return mapPoint(page, lngLat);
}

/**
 * viewport position inside a rendered fill of `source` where `where` (a function body over
 * `properties`) holds and no feature of `avoid` is rendered – found by scanning the canvas
 */
export async function featurePoint(
	page: Page,
	source: string,
	{ where = 'return true', avoid = [] as string[] } = {}
) {
	const point = await page.evaluate(
		({ source, where, avoid }) => {
			const map = window.__D2R_MAP__!;
			const matches = new Function('properties', where) as (p: unknown) => boolean;
			const { width, height } = map.getCanvas().getBoundingClientRect();
			for (let y = height * 0.2; y < height * 0.8; y += 15) {
				for (let x = width * 0.45; x < width * 0.9; x += 15) {
					const features = map.queryRenderedFeatures([x, y]);
					const fill = features.find((f) => f.source === source && f.layer.type === 'fill');
					if (!fill || !matches(fill.properties)) continue;
					if (features.some((f) => avoid.includes(f.source))) continue;
					// stay clear of the boundary lines
					if (features.some((f) => f.layer.type === 'line' && f.source === source)) continue;
					return { x, y };
				}
			}
			throw new Error(`no rendered feature of ${source} matching ${where}`);
		},
		{ source, where, avoid }
	);
	const box = (await page.locator('.maplibregl-canvas').boundingBox())!;
	return { x: box.x + point.x, y: box.y + point.y };
}

/** resolves once maplibre has rendered all tiles and finished every transition */
export async function waitForMapIdle(page: Page) {
	await page.waitForFunction(
		() => {
			const map = window.__D2R_MAP__;
			return (
				!!map && map.isStyleLoaded() && map.loaded() && map.areTilesLoaded() && !map.isMoving()
			);
		},
		null,
		{ timeout: 30_000 }
	);
	// one more frame: 'idle' fires after the repaint, unless nothing had to be rendered at all
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				const map = window.__D2R_MAP__!;
				map.once('idle', () => resolve());
				map.triggerRepaint();
				setTimeout(resolve, 2000);
			})
	);
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
}
