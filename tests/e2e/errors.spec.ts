import type { Page, Route } from '@playwright/test';
import { appUrl, expect, open, test } from './support/fixtures';

const unexpectedError = 'Unexpected error';
const datavis = (page: Page) => page.locator('#stations-datavis');
const histogram = (page: Page) => page.locator('#stations-histogram');

const stationIds = ['DOBHBF', 'DODFRP', 'DODGWS', 'DOBBHS', 'DOBBRS'];

/** a network snapshot of the default stations with the given visualization hints */
const snapshot = (visualization: unknown) => ({
	data: stationIds.map((station_id, i) => ({
		station_id,
		utci: 14 + i,
		measured_at: '2026-10-19T12:00:00Z'
	})),
	visualization
});

/** hourly measurements of a station for the last day */
const measurements = (value: number | null) => ({
	data: Array.from({ length: 24 }, (_, h) => ({
		station_id: 'DOBHBF',
		utci: value,
		measured_at: `2026-10-19T${String(h).padStart(2, '0')}:00:00Z`
	}))
});

const failures = {
	'a server error': (route: Route) => route.fulfill({ status: 500, body: 'Internal Server Error' }),
	'invalid json': (route: Route) => route.fulfill({ status: 200, body: '{"data": [' }),
	'an unexpected payload': (route: Route) => route.fulfill({ json: { data: [{ station_id: 1 }] } })
};

test.describe('station snapshot failures', () => {
	for (const [name, fulfill] of Object.entries(failures)) {
		test(`charts show ${name} of the snapshot`, async ({ page }) => {
			await page.route('**/v1/network-snapshot?**', fulfill);
			await open(page, '/en');
			// (next to the hint that no station delivered data)
			await expect(
				datavis(page).getByRole('alert').filter({ hasText: unexpectedError })
			).toBeVisible();
			await expect(histogram(page).getByRole('alert')).toContainText(unexpectedError);
		});
	}

	test('an unsupported snapshot (422) counts as no data', async ({ page }) => {
		await page.route('**/v1/network-snapshot?**', (route) =>
			route.fulfill({ status: 422, json: { detail: 'unsupported' } })
		);
		await open(page, '/en');
		await expect(datavis(page).getByRole('alert').first()).toContainText(
			'None of the selected stations collect data'
		);
		await expect(histogram(page)).toContainText('No data available for the selected configuration');
	});

	test('a snapshot without visualization hints still renders', async ({ page }) => {
		await page.route('**/v1/network-snapshot?**', (route) =>
			route.fulfill({ json: snapshot(null) })
		);
		await open(page, '/en');
		await expect(datavis(page).locator('svg.lc-layout-svg').first()).toContainText('Hauptbahnhof');
	});

	for (const [direction, visualization, min, max] of [
		['', { utci: { cmin: null, cmax: 30, vmin: null, vmax: 28 } }, '0 °C', '30 °C'],
		['negative ', { utci: { cmin: -12, cmax: null, vmin: -10, vmax: null } }, '-12 °C', '0 °C']
	] as const) {
		test(`a ${direction}one sided color scale is extended to zero`, async ({ page }) => {
			await page.route('**/v1/network-snapshot?**', (route) =>
				route.fulfill({ json: snapshot(visualization) })
			);
			await open(page, appUrl('/en', { sidebar: 'closed' }));
			const legend = page.locator('div.fixed.bottom-4.left-4');
			await expect(legend).toContainText(min);
			await expect(legend).toContainText(max);
		});
	}
});

test.describe('station data failures', () => {
	const range = { datavisType: 'range', range_start: -1 };

	test('the line chart shows a server error', async ({ page }) => {
		await page.route('**/v1/data/**', failures['a server error']);
		await open(page, appUrl('/en', range));
		await expect(page.locator('#linechart-container').getByRole('alert')).toContainText(
			unexpectedError
		);
	});

	test('stations without data for the indicator (422) are listed as unsupported', async ({
		page
	}) => {
		await page.route('**/v1/data/DOBHBF?**', (route) => route.fulfill({ status: 422, json: {} }));
		await open(page, appUrl('/en', range));
		await expect(datavis(page).getByRole('alert').first()).toContainText(
			'The station Hauptbahnhof does not collect data'
		);
	});

	test('stations with empty measurements are listed as unavailable', async ({ page }) => {
		await page.route('**/v1/data/DOBHBF?**', (route) =>
			route.fulfill({ json: measurements(null) })
		);
		await open(page, appUrl('/en', range));
		await expect(datavis(page).getByRole('alert')).toContainText(
			'The station Hauptbahnhof has no data available'
		);
	});

	test('a time range with only zero values still draws the color scale', async ({ page }) => {
		await page.route('**/v1/data/**', (route) => route.fulfill({ json: measurements(0) }));
		await open(page, appUrl('/en', range));
		const chart = page.locator('#linechart-container');
		// (a flat line has no height)
		await expect(chart.locator('path.stroke-2').first()).toBeAttached();
		await expect(chart.locator('linearGradient').first()).toBeAttached();
	});

	test('an empty time range shows that no data is available', async ({ page }) => {
		await page.route('**/v1/data/**', (route) => route.fulfill({ json: { data: [] } }));
		await open(page, appUrl('/en', range));
		await expect(page.locator('#linechart-container')).toContainText(
			'No data available for the selected configuration'
		);
	});

	test('wind directions show a server error', async ({ page }) => {
		await page.route('**/v1/data/**', failures['a server error']);
		await open(page, appUrl('/en', { ...range, unit: 'wind_direction' }));
		await expect(page.locator('#linechart-container').getByRole('alert')).toContainText(
			unexpectedError
		);
	});

	test('wind directions without data show that no data is available', async ({ page }) => {
		await page.route('**/v1/data/**', (route) => route.fulfill({ json: { data: [] } }));
		await open(page, appUrl('/en', { ...range, unit: 'wind_direction' }));
		await expect(page.locator('#linechart-container')).toContainText(
			'No data available for the selected configuration'
		);
	});
});

test.describe('heat atlas failures', () => {
	test('a failing raster dataset lookup shows no date and no legend range', async ({ page }) => {
		await page.route('**/tms/datasets?**', (route) =>
			route.fulfill({ status: 500, body: 'error' })
		);
		await open(page, '/en/heat-stress', { waitForMap: false });
		await expect(page.locator('#heat-stress-selector')).toBeVisible();
		await expect(page.locator('#left-sidebar-scroll-container').getByRole('alert')).toHaveCount(0);
	});

	test('missing raster metadata and colormap fall back to a default range', async ({ page }) => {
		await page.route('**/tms/metadata/**', (route) => route.fulfill({ status: 422, json: {} }));
		await page.route('**/tms/colormap?**', (route) => route.fulfill({ status: 422, json: {} }));
		await open(page, appUrl('/en/heat-stress', { sidebar: 'closed' }));
		const legend = page.locator('div.fixed.bottom-4.left-4');
		await expect(legend).toContainText('Universal thermal climate index (UTCI)');
		await expect(legend).not.toContainText('...');
	});
});
