import { expect, test, type Response } from '@playwright/test';
import { EXTERNAL_URL_RE } from '../support/constants.mjs';
import { waitForMapIdle } from '../e2e/support/fixtures';

/**
 * The only test that talks to the real services. It does not compare data (which changes every
 * hour) but checks that every upstream answers and that the dashboard can render what it gets.
 */
test('the dashboard works against the live api, tile server, geocoder and basemap', async ({
	page
}) => {
	const upstream: Response[] = [];
	const errors: string[] = [];
	page.on('response', (r) => EXTERNAL_URL_RE.test(r.url()) && upstream.push(r));
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	await page.addInitScript(() => localStorage.setItem('welcome-opened', 'false'));
	const responseOk = (pattern: RegExp) =>
		expect
			.poll(() => upstream.filter((r) => pattern.test(r.url())).map((r) => r.status()))
			.toContain(200);

	await test.step('measurements: stations from SSR and the current snapshot', async () => {
		await page.goto('/en?sidebar=simple');
		await waitForMapIdle(page);
		const stationCount = await page.evaluate(
			() => window.__D2R_MAP__!.querySourceFeatures('stations-outer-rings').length
		);
		expect(stationCount).toBeGreaterThan(20);
		await responseOk(/\/v1\/network-snapshot\?/);
		await responseOk(/tiles\.basemaps\.cartocdn\.com\/fonts\//);
		await responseOk(/tiles\.basemaps\.cartocdn\.com\/gl\/positron-gl-style\/sprite/);
		await expect(page.locator('#stations-datavis svg.layercake-layout-svg').first()).toContainText(
			'Hauptbahnhof'
		);
		await expect(
			page.locator('#stations-histogram svg.layercake-layout-svg').first()
		).toBeVisible();
	});

	await test.step('measurements: time series of the selected stations', async () => {
		await page.getByRole('button', { name: 'Time range' }).click();
		await responseOk(/\/v1\/data\/DOBHBF\?/);
		await expect(page.locator('#linechart-container path.stroke-2').first()).toBeVisible();
	});

	await test.step('map: address search and orthophotos', async () => {
		const search = page.getByPlaceholder('Enter a location...');
		await search.click();
		await search.pressSequentially(' Friedensplatz', { delay: 30 });
		await expect(page.getByRole('option').first()).toContainText('Friedensplatz');
		await responseOk(/geoweb1\.digistadtdo\.de\/doris_gdi\/geocoder\/geosearch\?/);

		await page.locator('button:has(svg.lucide-layers)').click();
		await page.getByRole('menuitem', { name: 'Digital Orthophotos' }).click();
		await page.keyboard.press('Escape');
		await responseOk(/www\.wms\.nrw\.de\/geobasis\/wms_nw_dop/);
	});

	await test.step('heat atlas: latest raster, tiles and colormap', async () => {
		await page.getByRole('link', { name: 'Heat atlas' }).click();
		await expect(page).toHaveURL(/\/en\/heat-stress/);
		await responseOk(/\/tms\/datasets\?param=UTCI&/);
		await responseOk(/\/tms\/metadata\/UTCI\//);
		await responseOk(/\/tms\/colormap\?/);
		await expect
			.poll(() =>
				upstream
					.filter((r) => /\/tms\/singleband\/UTCI\/.+\.png/.test(r.url()) && r.status() === 200)
					.map((r) => r.headers()['content-type'])
			)
			.toContain('image/png');
		await expect(page.locator('#left-sidebar-scroll-container').getByRole('alert')).toContainText(
			'You are viewing data from'
		);
	});

	await test.step('stations table', async () => {
		await page.getByRole('link', { name: 'Weather stations' }).click();
		await expect(page.locator('#stations-table tbody tr')).toHaveCount(13);
	});

	await test.step('no errors and every upstream answered', async () => {
		const failed = upstream.filter((r) => r.status() >= 400).map((r) => `${r.status()} ${r.url()}`);
		expect(failed).toEqual([]);
		expect(errors.filter((e) => /zod|validation|unexpected/i.test(e))).toEqual([]);
		await expect(page.getByText('Unexpected error')).toHaveCount(0);
	});
});
