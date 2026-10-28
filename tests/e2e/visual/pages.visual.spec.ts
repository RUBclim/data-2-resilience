import type { Page } from '@playwright/test';
import {
	appUrl,
	expect,
	open,
	test,
	waitForMapIdle,
	waitForUrlToSettle
} from '../support/fixtures';

/**
 * Strict screenshot tests (0 differing pixels, see playwright.config.ts). They only run inside
 * the pinned docker image (`pnpm test:e2e:docker`), because fonts and the software WebGL
 * rasterizer differ between machines.
 */
async function snapshot(page: Page, name: string) {
	if (await page.locator('#map').count()) await waitForMapIdle(page);
	// legends/charts render placeholders while their queries load (some spinners stay in the DOM
	// with opacity 0)
	await expect
		.poll(() =>
			page.evaluate(
				() =>
					[...document.querySelectorAll('.animate-pulse, .animate-spin')].filter((el) =>
						el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
					).length
			)
		)
		.toBe(0);
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await expect(page).toHaveScreenshot(`${name}.png`);
}

const scenarios: [name: string, url: string][] = [
	['measurements', '/en'],
	['measurements-per-day', appUrl('/en', { datavisType: 'day', minMaxAvg: 'max' })],
	['measurements-time-range', appUrl('/en', { datavisType: 'range' })],
	['measurements-category', appUrl('/en', { unit: 'utci_category' })],
	[
		'measurements-wind-direction',
		appUrl('/en', { unit: 'wind_direction', datavisType: 'range', range_start: -2 })
	],
	['measurements-single-station', appUrl('/en', { selectedStations: 'DOBHBF' })],
	['measurements-german', '/de'],
	['measurements-sidebar-closed', appUrl('/en', { sidebar: 'closed' })],
	['measurements-lors', appUrl('/en', { sidebar: 'closed', boundariesMode: 'lors' })],
	['measurements-satellite', appUrl('/en', { sidebar: 'closed', showSatellite: true })],
	['heat-stress', '/en/heat-stress'],
	['heat-stress-category', appUrl('/en/heat-stress', { heatStress: 'utci_category' })],
	[
		'heat-stress-humidity',
		appUrl('/en/heat-stress', { heatStress: 'relative_humidity', sidebar: 'closed' })
	],
	[
		'heat-stress-air-temperature',
		appUrl('/en/heat-stress', { heatStress: 'air_temperature', sidebar: 'closed' })
	],
	['stations', '/en/stations'],
	['about', '/en/about'],
	['imprint', '/en/imprint'],
	['privacy-policy', '/en/privacy-policy']
];

for (const [name, url] of scenarios) {
	test(name, async ({ page }) => {
		await open(page, url);
		await snapshot(page, name);
	});
}

// the histogram sits below the charts: scroll the left sidebar down to it
for (const [name, url] of [
	['histogram', '/en'],
	['histogram-category', appUrl('/en', { unit: 'utci_category' })]
] as const) {
	test(name, async ({ page }) => {
		await open(page, url);
		const histogram = page.locator('#stations-histogram');
		await expect(histogram.locator('.lc-tooltip-rect').first()).toBeAttached();
		await histogram.evaluate((el) => el.scrollIntoView({ block: 'start' }));
		await snapshot(page, name);
	});
}

test('dark mode', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await open(page, '/en');
	await snapshot(page, 'measurements-dark');
	await open(page, appUrl('/en/heat-stress', { sidebar: 'closed' }));
	await snapshot(page, 'heat-stress-dark');
	await open(page, '/en/stations');
	await snapshot(page, 'stations-dark');
});

test('404', async ({ page }) => {
	await page.goto('/en/does-not-exist');
	await snapshot(page, '404');
});

test.describe('first visit', () => {
	test.use({ skipWelcomeTour: false });

	test('welcome message and tour', async ({ page }) => {
		await open(page, '/en');
		await snapshot(page, 'welcome-message');
		// the tour switches to its demo settings (two days back) through debounced url setters; the
		// charts keep showing the previous day until the data of that day has arrived
		const demoDay = page.waitForResponse(/\/v1\/network-snapshot\?date=2026-10-17/);
		await page.getByRole('button', { name: 'Start the tour' }).click();
		await expect(page.locator('.shepherd-element:visible')).toContainText('1/8');
		await demoDay;
		await expect(page.locator('#stations-datavis')).toContainText('17th October 2026');
		await waitForUrlToSettle(page);
		await snapshot(page, 'welcome-tour');
	});
});

test('map layer menu', async ({ page }) => {
	await open(page, appUrl('/en', { sidebar: 'closed' }));
	await page.locator('button:has(svg.lucide-layers)').click();
	await expect(page.getByRole('menu')).toBeVisible();
	await snapshot(page, 'layer-menu');
});

test('health risks', async ({ page }) => {
	await open(page, appUrl('/en', { sidebar: 'closed' }));
	// (comboboxes take no accessible name from their content)
	await page.getByRole('combobox').filter({ hasText: 'Show health risks' }).click();
	await expect(page.getByRole('combobox').filter({ hasText: 'Hide health risks' })).toBeVisible();
	await snapshot(page, 'health-risks');
});
