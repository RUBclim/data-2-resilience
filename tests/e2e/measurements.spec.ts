import type { Locator, Page } from '@playwright/test';
import { appUrl, expect, open, revealTooltip, test, waitForUrlToSettle } from './support/fixtures';

const datavis = (page: Page) => page.locator('#stations-datavis');
const histogram = (page: Page) => page.locator('#stations-histogram');
const chartSvg = (container: Locator) => container.locator('svg.lc-layout-svg').first();
const hourButton = (page: Page, direction: 'later' | 'earlier') =>
	page.locator(`button[aria-label="Select an hour ${direction}"]`);
const exportMenuButton = (container: Locator) =>
	container.locator('button:has(svg.lucide-ellipsis-vertical)').first();

async function selectStation(page: Page, name: string) {
	await page.locator('#stations-select').fill(name);
	await page.locator('ul.options li', { hasText: name }).first().click();
}

/** answers network snapshot requests with the given station values */
async function mockSnapshot(page: Page, param: string, values: Record<string, number | null>) {
	await page.route('**/v1/network-snapshot?**', (route) =>
		route.fulfill({
			json: {
				data: Object.entries(values).map(([station_id, value]) => ({
					station_id,
					[param]: value,
					measured_at: '2026-10-19T12:00:00Z'
				})),
				visualization: { [param]: { cmin: 10, cmax: 30, vmin: 12, vmax: 28 } }
			}
		})
	);
}

test.describe('stations selection', () => {
	test('shows the default stations in the bar chart', async ({ page }) => {
		await open(page, '/en');
		const chart = datavis(page);
		await expect(chart).toContainText('Universal thermal climate index (UTCI) (°C)');
		await expect(chart).toContainText('19th October 2026 14:00');
		for (const name of ['Friedensplatz', 'Hauptbahnhof', 'Scharnhorst']) {
			await expect(chartSvg(chart)).toContainText(name);
		}
	});

	test('stations can be added, removed and cleared', async ({ page }) => {
		await open(page, '/en');
		await selectStation(page, 'Bolmke');
		await expect(page).toHaveURL(/selectedStations=DOBHBF%2CDODBOL%2CDODFRP%2CDODGWS/);
		await expect(chartSvg(datavis(page))).toContainText('Bolmke');

		await page.locator('button[title="Remove Bolmke"]').click();
		await expect(page).toHaveURL(/selectedStations=DOBHBF%2CDODFRP%2CDODGWS/);

		await page.locator('button[title="Remove all"]').click();
		await expect(datavis(page)).toContainText('Select at least one station to display its data');
		await expect(page).toHaveURL(/selectedStations=(&|$)/);
	});

	test('reads the selected stations from the url and ignores unknown ids', async ({ page }) => {
		await open(page, appUrl('/en', { selectedStations: 'DODPHX,NOPE,DOBHBF' }));
		await expect(page.locator('ul.selected > li')).toHaveText(['Hauptbahnhof', 'Phoenix See']);
	});

	test('a single station shows its value and health risk', async ({ page }) => {
		await open(page, appUrl('/en', { selectedStations: 'DOBHBF' }));
		const chart = datavis(page);
		await expect(chart.locator('strong.text-3xl')).toHaveText(/^\s*[\d.]+\s*°C\s*$/);
		await expect(chart.locator('p.text-xl')).toHaveText(/stress/i);
	});

	test('a single station shows its category', async ({ page }) => {
		await open(page, appUrl('/en', { selectedStations: 'DOBHBF', unit: 'utci_category' }));
		const value = datavis(page).locator('strong.text-3xl');
		await expect(value).toHaveText(/stress/i);
		await expect(value.locator('.rounded-full')).toBeVisible();
	});

	for (const [ids, message] of [
		[
			'DOBHBF,DOTABA,DOTABS',
			'The stations Barop, Westerfilde do not collect data for the selected'
		],
		['DOBHBF,DOTABA', 'The station Westerfilde does not collect data for the indicator'],
		['DOTABA', 'None of the selected stations collect data for the indicator']
	] as const) {
		test(`warns about stations that do not measure the indicator (${ids})`, async ({ page }) => {
			await open(page, appUrl('/en', { selectedStations: ids }));
			await expect(datavis(page).getByRole('alert').first()).toContainText(message);
		});
	}

	for (const [values, message] of [
		[
			{ DOBHBF: null, DODFRP: null, DODGWS: 21.5 },
			'The stations Friedensplatz, Hauptbahnhof have no'
		],
		[
			{ DOBHBF: null, DODFRP: 19.5, DODGWS: 21.5 },
			'The station Hauptbahnhof has no data available'
		],
		[
			{ DOBHBF: null, DODFRP: null, DODGWS: null },
			'None of the selected stations have data available'
		]
	] as const) {
		test(`warns about stations without data (${Object.values(values).join()})`, async ({
			page
		}) => {
			await mockSnapshot(page, 'utci', values);
			await open(page, '/en');
			await expect(datavis(page).getByRole('alert')).toContainText(message);
		});
	}
});

test.describe('indicator selection', () => {
	test('the combobox filters and selects indicators', async ({ page, hasTouch }) => {
		await open(page, '/en');
		const combobox = page.locator('#unit-select').getByRole('combobox');
		await expect(combobox).toHaveText('Universal thermal climate index (UTCI)');

		await combobox.click();
		const search = page.getByPlaceholder('Search climate indicator...');
		await search.fill('does-not-exist');
		await expect(page.getByText('No climate indicator found')).toBeVisible();

		await search.fill('humid');
		const option = page.getByRole('option', { name: /^Relative humidity/ });
		await expect(option).toContainText('(%)');
		if (!hasTouch) {
			// each indicator explains itself on hover
			await option.getByText('Relative humidity').hover();
			await expect(
				page.getByText('compared to the maximum amount it could hold', { exact: false })
			).toBeVisible();
		}
		await option.click();
		await expect(page).toHaveURL(/unit=relative_humidity/);
		await expect(combobox).toHaveText('Relative humidity');
		await expect(combobox).toBeFocused();
		await expect(datavis(page)).toContainText('Relative humidity (%)');
	});

	test('unknown indicators in the url fall back to the placeholder', async ({ page }) => {
		await open(page, appUrl('/en', { unit: 'utci', minMaxAvg: 'nonsense' }));
		await expect(page.locator('#unit-select').getByRole('combobox')).toHaveText(
			'Universal thermal climate index (UTCI)'
		);
	});

	test('an unknown indicator shows the placeholder', async ({ page }) => {
		await open(page, appUrl('/en', { unit: 'nonsense' }));
		await expect(page.locator('#unit-select').getByRole('combobox')).toHaveText(
			'Select a climate indicator'
		);
	});

	test('the description of the indicator can be expanded', async ({ page }) => {
		await open(page, '/en');
		const unitSelect = page.locator('#unit-select');
		await unitSelect.getByRole('button', { name: 'Know more' }).click();
		await expect(unitSelect.getByRole('button', { name: 'Collapse' })).toBeVisible();
		await unitSelect.getByRole('button', { name: 'Collapse' }).click();
		await expect(unitSelect.getByRole('button', { name: 'Know more' })).toBeVisible();
	});

	test('category indicators show the categories of each station', async ({ page }) => {
		await open(page, appUrl('/en', { unit: 'utci_category' }));
		const chart = datavis(page);
		for (const name of ['Friedensplatz', 'Hauptbahnhof', 'Scharnhorst']) {
			await expect(chart).toContainText(name);
		}
		await expect(chart).toContainText(/stress/i);
		await expect(chartSvg(histogram(page))).toContainText(/stress/i);
	});
});

test.describe('time selection', () => {
	test('the hour can be changed with the arrows and the input', async ({ page }) => {
		await open(page, '/en');
		const later = hourButton(page, 'later');
		const earlier = hourButton(page, 'earlier');
		const input = page.getByLabel('Select hour of the day');

		await expect(input).toHaveValue('14:00');
		await expect(later).toBeDisabled();

		await earlier.click();
		await expect(input).toHaveValue('13:00');
		await expect(page).toHaveURL(/hour=13/);
		await expect(datavis(page)).toContainText('19th October 2026 13:00');

		await later.click();
		await expect(input).toHaveValue('14:00');

		await input.fill('05:00');
		await expect(page).toHaveURL(/hour=5(&|$)/);

		// clearing the input keeps the hour
		await input.fill('');
		await expect(datavis(page)).toContainText('19th October 2026 05:00');
		await expect(page).toHaveURL(/hour=5(&|$)/);
	});

	test('the hour wraps around midnight on past days', async ({ page }) => {
		await open(page, appUrl('/en', { day_value: -1, hour: 0 }));
		const input = page.getByLabel('Select hour of the day');
		await expect(input).toHaveValue('00:00');
		await hourButton(page, 'earlier').click();
		await expect(input).toHaveValue('23:00');
		await hourButton(page, 'later').click();
		await expect(input).toHaveValue('00:00');
	});

	test('hours in the future are clamped to the current hour', async ({ page }) => {
		await open(page, appUrl('/en', { hour: 20 }));
		await expect(page.getByLabel('Select hour of the day')).toHaveValue('14:00');
	});

	test('the day slider moves the selected day', async ({ page }) => {
		await open(page, '/en');
		await page.locator('#date-range-slider .rangeHandle').focus();
		await page.keyboard.press('ArrowLeft');
		await expect(page).toHaveURL(/day_value=-1/);
		await expect(datavis(page)).toContainText('18th October 2026 14:00');
		await expect(page.locator('#date-range-slider')).toContainText('Today');
	});

	test('per day shows daily aggregates with a min/max/avg selection', async ({ page }) => {
		await open(page, '/en');
		await page.getByRole('button', { name: 'Per day' }).click();
		await expect(page).toHaveURL(/datavisType=day/);
		await expect(datavis(page)).toContainText('19th October 2026');
		await expect(page.getByLabel('Select hour of the day')).toHaveCount(0);

		await datavis(page).getByRole('combobox').click();
		await page.getByRole('option', { name: 'Maximum' }).click();
		await expect(page).toHaveURL(/minMaxAvg=max/);
		await expect(datavis(page).getByRole('combobox')).toHaveText('Maximum');

		await page.getByRole('button', { name: 'Per hour' }).click();
		await expect(page).toHaveURL(/datavisType=hour/);
		await expect(page.getByLabel('Select hour of the day')).toBeVisible();
	});

	test('maximum wind speed per day has no min/max/avg selection', async ({ page }) => {
		await open(page, appUrl('/en', { unit: 'maximum_wind_speed', datavisType: 'day' }));
		await expect(datavis(page)).toContainText('Maximum wind speed');
		await expect(datavis(page).getByRole('combobox')).toHaveCount(0);
	});

	test('time range shows a line chart over the selected days', async ({ page }) => {
		await open(page, '/en');
		await page.getByRole('button', { name: 'Time range' }).click();
		await expect(page).toHaveURL(/datavisType=range/);
		await expect(datavis(page)).toContainText('9th - 19th October 2026');
		const chart = page.locator('#linechart-container');
		await expect(chart.locator('path.stroke-2')).toHaveCount(3);
		await expect(histogram(page)).toHaveCount(0);

		const [start] = await page.locator('#date-range-slider .rangeHandle').all();
		await start.focus();
		await page.keyboard.press('ArrowLeft');
		await expect(page).toHaveURL(/range_start=-11/);
		await expect(datavis(page)).toContainText('8th - 19th October 2026');
	});

	test('time ranges across months and years are formatted fully', async ({ page }) => {
		await open(page, appUrl('/en', { datavisType: 'range', range_start: -30, range_end: -1 }));
		await expect(datavis(page)).toContainText('19th September - 18th October 2026');

		await open(page, appUrl('/en', { datavisType: 'range', range_start: -2, range_end: -2 }));
		await expect(datavis(page)).toContainText('19th October 2026');
	});

	test('wind directions are shown as arrows', async ({ page }) => {
		await open(
			page,
			appUrl('/en', { unit: 'wind_direction', datavisType: 'range', range_start: -1 })
		);
		const chart = page.locator('#linechart-container');
		await expect(chart.locator('svg path[transform-origin]').first()).toBeVisible();
	});

	test('category indicators are shown on an ordinal line chart', async ({ page }) => {
		await open(
			page,
			appUrl('/en', { unit: 'utci_category', datavisType: 'range', range_start: -1 })
		);
		await expect(chartSvg(page.locator('#linechart-container'))).toContainText(/stress/i);
	});

	test('the info tooltip explains the time selection', async ({ page }) => {
		await open(page, '/en');
		await revealTooltip(page.locator('#date-range-slider button:has(svg.lucide-info)'));
		await expect(page.getByText('How does the time selection work?')).toBeVisible();
	});
});

test.describe('charts', () => {
	test.beforeEach(({ isMobile, hasTouch }) =>
		test.skip(isMobile || hasTouch, 'hover tooltips need a mouse')
	);

	test('the bar chart shows a tooltip per station', async ({ page }) => {
		await open(page, appUrl('/en', { selectedStations: 'DOBHBF,DOTABA' }));
		// with a single bar its band covers the middle of the plot (engines measure svg text
		// differently, so do not aim at the label)
		const box = (await chartSvg(datavis(page)).boundingBox())!;
		await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4, { steps: 5 });
		await expect(datavis(page).getByText(/^[\d.]+ °C/)).toBeVisible();
		await expect(datavis(page)).toContainText('No thermal stress');
	});

	test('the line chart shows a tooltip for the hovered time', async ({ page }) => {
		await open(page, appUrl('/en', { datavisType: 'range', range_start: -2 }));
		const chart = page.locator('#linechart-container');
		await chart.locator('path.stroke-2').first().waitFor();
		await chartSvg(chart).hover({ position: { x: 200, y: 100 } });
		await chartSvg(chart).hover({ position: { x: 220, y: 110 } });
		await expect(chart.getByText(/October \d+, 2026 at \d\d:00/)).toBeVisible();
	});

	test('the bar chart tooltip of other indicators has no health risk', async ({ page }) => {
		// a value of 0, a long station name and a station without data, without visualization hints
		await page.route('**/v1/network-snapshot?**', (route) =>
			route.fulfill({
				json: {
					data: [
						['DOBHBF', 0],
						['DOTKLS', 5],
						['DOTWFP', null]
					].map(([station_id, air_temperature]) => ({
						station_id,
						air_temperature,
						measured_at: '2026-10-19T12:00:00Z'
					})),
					visualization: null
				}
			})
		);
		await open(
			page,
			appUrl('/en', { unit: 'air_temperature', selectedStations: 'DOBHBF,DOTKLS,DOTWFP' })
		);
		await expect(datavis(page).getByRole('alert')).toContainText('Westfalenhalle, Parkplatz');
		const svg = chartSvg(datavis(page));
		await expect(svg).toContainText('Kleppingstraße E...');
		const box = (await svg.boundingBox())!;
		const tooltip = datavis(page).locator('strong', { hasText: 'Hauptbahnhof' });
		await expect(async () => {
			for (const y of [0.15, 0.3, 0.45]) {
				await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * y, { steps: 3 });
				if (await tooltip.isVisible()) return;
			}
			throw new Error('no tooltip for Hauptbahnhof');
		}).toPass();
		await expect(datavis(page)).not.toContainText('thermal stress');
	});

	test('the line chart tooltip of category indicators shows the categories', async ({ page }) => {
		await open(
			page,
			appUrl('/en', { unit: 'utci_category', datavisType: 'range', range_start: -1 })
		);
		const chart = page.locator('#linechart-container');
		// (flat lines of categories have no height)
		await chart.locator('path.stroke-2').first().waitFor({ state: 'attached' });
		await chartSvg(chart).hover({ position: { x: 300, y: 100 } });
		await chartSvg(chart).hover({ position: { x: 320, y: 110 } });
		const tooltip = chart.locator('span.chart-export-ignore');
		await expect(tooltip).toContainText(/October \d+, 2026 at \d\d:00/);
		await expect(tooltip).toContainText(/stress/i);
	});

	test('the line chart tooltip of other indicators shows the values', async ({ page }) => {
		await open(
			page,
			appUrl('/en', { unit: 'air_temperature', datavisType: 'range', range_start: -1 })
		);
		const chart = page.locator('#linechart-container');
		await chart.locator('path.stroke-2').first().waitFor();
		await chartSvg(chart).hover({ position: { x: 300, y: 100 } });
		await chartSvg(chart).hover({ position: { x: 320, y: 110 } });
		const tooltip = chart.locator('span.chart-export-ignore');
		await expect(tooltip).toContainText('°C');
		await expect(tooltip).not.toContainText('stress');
	});

	test('the wind direction chart shows the directions in its tooltip', async ({ page }) => {
		await open(
			page,
			appUrl('/en', { unit: 'wind_direction', datavisType: 'range', range_start: -1 })
		);
		const chart = page.locator('#linechart-container');
		await chart.locator('svg path[transform-origin]').first().waitFor();
		await chartSvg(chart).hover({ position: { x: 200, y: 100 } });
		await chartSvg(chart).hover({ position: { x: 220, y: 110 } });
		const tooltip = page
			.locator('span.chart-export-ignore')
			.filter({ hasText: /October \d+, 2026/ });
		await expect(tooltip).toBeVisible();
		await expect(tooltip).toContainText('↑');
		await expect(tooltip).toContainText('°');
	});

	test('the histogram tooltip lists the selected stations and selects a bin on click', async ({
		page
	}) => {
		await open(page, '/en');
		const bins = histogram(page).locator('.lc-tooltip-rect');
		await expect(bins.first()).toBeVisible();
		const count = await bins.count();
		for (let i = 0; i < count; i++) {
			await bins.nth(i).hover();
			const tooltip = histogram(page).getByText(/Click to select/);
			if (await tooltip.isVisible()) {
				const before = page.url();
				await bins.nth(i).click();
				await expect.poll(() => page.url()).not.toBe(before);
				return;
			}
		}
		throw new Error('no histogram bin offered to select stations');
	});

	test('the ordinal histogram selects all stations of a category', async ({ page }) => {
		await open(page, appUrl('/en', { unit: 'utci_category' }));
		const bins = histogram(page).locator('.lc-tooltip-rect');
		await expect(bins.first()).toBeVisible();
		const count = await bins.count();
		for (let i = 0; i < count; i++) {
			await bins.nth(i).hover();
			if (
				await histogram(page)
					.getByText(/values in the category/)
					.isVisible()
			) {
				if (
					await histogram(page)
						.getByText(/Click to select/)
						.isVisible()
				) {
					const before = page.url();
					await bins.nth(i).click();
					await expect.poll(() => page.url()).not.toBe(before);
					return;
				}
			}
		}
		throw new Error('no category bin offered to select stations');
	});
});

test.describe('chart export', () => {
	for (const [name, params, container] of [
		['bar chart', {}, '#stations-datavis'],
		['histogram', {}, '#stations-histogram'],
		['line chart', { datavisType: 'range', range_start: -1 }, '#stations-datavis']
	] as const) {
		test(`the ${name} can be exported as png`, async ({ page }) => {
			// html2canvas renders at 4x, which takes long on mobile viewports
			test.slow();
			await open(page, appUrl('/en', params));
			const box = page.locator(container);
			await expect(chartSvg(box)).toBeVisible();
			await exportMenuButton(box).click();
			const downloadPromise = page.waitForEvent('download');
			await page.getByRole('menuitem', { name: 'Export chart' }).click();
			const download = await downloadPromise;
			expect(download.suggestedFilename()).toMatch(
				/^stations-[a-z]+-utci-2026-10-19-14-\d\d\.png$/
			);
			await waitForUrlToSettle(page);
		});
	}
});
