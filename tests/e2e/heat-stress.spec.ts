import type { Page } from '@playwright/test';
import {
	appUrl,
	expect,
	open,
	revealTooltip,
	test,
	waitForMapIdle,
	waitForUrlToSettle
} from './support/fixtures';

const legend = (page: Page) => page.locator('div.fixed.bottom-4.left-4');
const sidebar = (page: Page) => page.locator('#left-sidebar-scroll-container');

/** pretends the latest raster layer is from the given UTC day of year and hour */
async function mockLatestRaster(page: Page, doy: number, hour: number) {
	await page.route('**/tms/datasets?**', (route) => {
		const param = new URL(route.request().url()).searchParams.get('param');
		return route.fulfill({
			json: {
				datasets: [{ doy: `${doy}`, hour: `${hour}`, param, year: '2026' }],
				limit: 1,
				page: 0
			}
		});
	});
}

test.describe('indicator selection', () => {
	test('shows the latest UTCI raster with its legend', async ({ page }) => {
		const tile = page.waitForResponse(
			/\/tms\/singleband\/UTCI\/2026\/\d{3}\/\d{2}\/\d+\/\d+\/\d+\.png/
		);
		await open(page, '/en/heat-stress');
		await expect(page.getByRole('heading', { name: 'How warm does the city feel?' })).toBeVisible();
		expect((await tile).status()).toBe(200);
		await waitForMapIdle(page);

		await expect(legend(page)).toContainText('Universal thermal climate index (UTCI)');
		await expect(legend(page)).toContainText(/-?\d+ °C/);
		await expect(sidebar(page).getByRole('alert')).toContainText('You are viewing data from');
	});

	test('switches between category, temperature, humidity and air temperature', async ({ page }) => {
		await open(page, '/en/heat-stress');
		const nav = page.locator('#heat-stress-selector');

		await nav.getByRole('button', { name: 'By heat stress category' }).click();
		await expect(page).toHaveURL(/heatStress=utci_category/);
		await waitForUrlToSettle(page);
		await expect(page).toHaveURL(/heatStress=utci_category/);
		await expect(legend(page)).toContainText('Extreme cold stress');
		await expect(legend(page)).toContainText('Extreme heat stress');
		await waitForMapIdle(page);

		await nav.getByRole('button', { name: 'By temperature in °C' }).click();
		await expect(page).toHaveURL(/heatStress=utci(&|$)/);
		await waitForUrlToSettle(page);
		await expect(page).toHaveURL(/heatStress=utci(&|$)/);

		await nav.getByRole('button', { name: 'Relative humidity' }).click();
		await expect(page).toHaveURL(/heatStress=relative_humidity/);
		await waitForUrlToSettle(page);
		await expect(page).toHaveURL(/heatStress=relative_humidity/);
		await expect(legend(page)).toContainText(/\d+ %/);
		await expect(nav.getByRole('button', { name: 'By heat stress category' })).toHaveCount(0);
		await waitForMapIdle(page);

		await nav.getByRole('button', { name: 'Air temperature' }).click();
		await expect(page).toHaveURL(/heatStress=air_temperature/);
		await waitForUrlToSettle(page);
		await expect(page).toHaveURL(/heatStress=air_temperature/);
		await expect(legend(page)).toContainText(/\d+ °C/);
		await waitForMapIdle(page);

		// the indicator card itself selects the category view for UTCI
		await nav
			.getByRole('button', { name: 'Universal thermal climate index (UTCI)', exact: true })
			.click();
		await expect(page).toHaveURL(/heatStress=utci_category/);
		await waitForUrlToSettle(page);
		await expect(page).toHaveURL(/heatStress=utci_category/);
	});

	test('the indicator info explains the indicator', async ({ page }) => {
		await open(page, '/en/heat-stress');
		await revealTooltip(
			page.locator('#heat-stress-selector > ul > li').nth(1).locator('button:has(svg.lucide-info)')
		);
		await expect(page.getByText(/humidity/i).last()).toBeVisible();
	});

	test('the category legend explains each category', async ({ page }) => {
		await open(page, appUrl('/en/heat-stress', { heatStress: 'utci_category', sidebar: 'closed' }));
		await revealTooltip(legend(page).locator('button').first());
		await expect(page.getByText('below -40 °C')).toBeVisible();
	});
});

test.describe('url', () => {
	// KNOWN BUG: an unknown indicator is not validated: the raster datasets are requested with
	// `param=FOO` and the heat atlas stays empty. Remove `test.fail` once fixed.
	test.fail('an unknown indicator shows the UTCI raster', async ({ page }) => {
		test.setTimeout(30_000);
		await open(page, appUrl('/en/heat-stress', { heatStress: 'foo', sidebar: 'closed' }), {
			waitForMap: false
		});
		await expect(page.locator('div.fixed.bottom-4.left-4')).toContainText(
			'Universal thermal climate index (UTCI)',
			{ timeout: 5000 }
		);
	});

	test('neighborhoods show the action areas as outlines', async ({ page }) => {
		await open(page, appUrl('/en/heat-stress', { boundariesMode: 'lors', sidebar: 'closed' }));
		const visibilities = await page.evaluate(() =>
			window
				.__D2R_MAP__!.getStyle()
				.layers.filter((layer) => 'source' in layer && layer.source === 'action-areas')
				.map((layer) => layer.layout?.visibility)
		);
		expect(visibilities).toContain('visible');
	});
});

test.describe('data freshness', () => {
	for (const [name, doy, hour, title, description] of [
		['current', 292, 12, /You are viewing data from October 19.*$/, 'up-to-date'],
		['some hours old', 292, 6, /\(from 6 hours ago\)/, '6 hours'],
		['days old', 289, 12, /\(from 3 days ago\)/, '3 days']
	] as const) {
		test(`tells when the raster is ${name}`, async ({ page }) => {
			await mockLatestRaster(page, doy, hour);
			await page.route('**/tms/singleband/**', (route) =>
				route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.alloc(0) })
			);
			await page.route('**/tms/metadata/**', (route) =>
				route.fulfill({ json: { range: [5, 25], cmap: 'turbo', name: 'UTCI' } })
			);
			await open(page, '/en/heat-stress');
			const alert = sidebar(page).getByRole('alert');
			await expect(alert).toContainText(title);
			await expect(alert).toContainText(description);
		});
	}

	test('shows no date without any raster', async ({ page }) => {
		await page.route('**/tms/datasets?**', (route) =>
			route.fulfill({ json: { datasets: [], limit: 1, page: 0 } })
		);
		await open(page, '/en/heat-stress');
		await expect(page.locator('#heat-stress-selector')).toBeVisible();
		await expect(sidebar(page).getByRole('alert')).toHaveCount(0);
	});
});

test.describe('missing tiles', () => {
	test('lists missing tiles and can be dismissed', async ({ page }) => {
		await page.route('**/tms/singleband/**', (route) =>
			route.fulfill({ status: 404, json: { message: 'not found' } })
		);
		// other missing resources of the map (here: the sprite of the base map) are not reported
		await page.route(/\/sprite(@2x)?\.(json|png)$/, (route) => route.fulfill({ status: 404 }));
		// tiles that fail to load keep the map from ever becoming idle
		await open(page, appUrl('/en/heat-stress', { sidebar: 'closed' }), { waitForMap: false });
		const alert = page.locator('#map').getByRole('alert');
		await expect(alert).toContainText(/\d+ tiles could not be loaded\./);
		await expect(alert).toContainText(
			'No data for the unit "Universal thermal climate index (UTCI)"'
		);
		await expect(alert).not.toContainText('sprite');

		await alert.getByRole('button', { name: 'Dismiss' }).click();
		await expect(alert).toHaveCount(0);
		await page.locator('#map button:has(svg.lucide-triangle-alert)').click();
		await expect(page.locator('#map').getByRole('alert')).toBeVisible();
	});
});

test.describe('legend', () => {
	test('lists the health risks of the selected indicator', async ({ page }) => {
		await open(page, appUrl('/en', { sidebar: 'closed' }));
		await expect(legend(page)).toContainText('Does not collect data');
		await expect(legend(page)).toContainText('No data available');

		await legend(page).getByRole('combobox').click();
		const risks = page.locator('ul').filter({ hasText: 'Extreme heat stress' });
		await expect(risks).toBeVisible();
		await expect(legend(page).getByRole('combobox')).toHaveText('Hide health risks');
		await page
			.locator('[data-popover-content] strong button, [role=dialog] strong button')
			.first()
			.click();
		await expect(legend(page).getByRole('combobox')).toHaveText('Show health risks');
	});

	test('wind directions get an arrow instead of a color scale', async ({ page }) => {
		await open(page, appUrl('/en', { sidebar: 'closed', unit: 'wind_direction' }));
		await expect(legend(page)).toContainText('Wind direction');
		await expect(legend(page)).toContainText('Data available');
	});

	test('category indicators show the categories', async ({ page }) => {
		await open(page, appUrl('/en', { sidebar: 'closed', unit: 'pet_category' }));
		await expect(legend(page)).toContainText('Extreme cold stress');
	});

	test('is hidden behind the sidebar on small screens', async ({ page }) => {
		await page.setViewportSize({ width: 600, height: 900 });
		await open(page, '/en');
		await expect(legend(page)).toHaveCSS('opacity', '0');
	});
});
