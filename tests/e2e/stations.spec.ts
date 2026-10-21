import type { Page } from '@playwright/test';
import { appUrl, expect, open, revealTooltip, test, waitForUrlToSettle } from './support/fixtures';

// the sidebar covers the table on small screens
const closedSidebar = { sidebar: 'closed' };
const stationsUrl = appUrl('/en/stations', closedSidebar);

const table = (page: Page) => page.locator('#stations-table');
const rows = (page: Page) => table(page).locator('tbody tr');
const cells = (page: Page, column: number) =>
	rows(page).locator(`td:nth-child(${column})`).allInnerTexts();
const pager = (page: Page) => table(page).locator('div.border-t').getByRole('button');

test.describe('stations table', () => {
	test('lists the stations page by page', async ({ page }) => {
		await open(page, stationsUrl);
		await expect(page.getByRole('heading', { name: 'Overview of all stations' })).toBeVisible();
		await expect(rows(page)).toHaveCount(13);
		await expect(table(page)).toContainText('Page 1 of 6');

		const [first, previous, next, last] = await pager(page).all();
		await expect(first).toBeDisabled();
		await next.click();
		await expect(table(page)).toContainText('Page 2 of 6');
		await last.click();
		await expect(table(page)).toContainText('Page 6 of 6');
		await expect(next).toBeDisabled();
		await previous.click();
		await expect(table(page)).toContainText('Page 5 of 6');
		await first.click();
		await expect(table(page)).toContainText('Page 1 of 6');
	});

	const sortingTest =
		(header: string, column: number) =>
		async ({ page }: { page: Page }) => {
			await open(page, stationsUrl);
			const button = table(page).getByRole('button', { name: header, exact: true });
			const collator = new Intl.Collator('en');
			const isSorted = async (direction: 1 | -1) => {
				const values = await cells(page, column);
				return values.every(
					(v, i) => i === 0 || direction * collator.compare(values[i - 1], v) <= 0
				);
			};

			await button.click();
			await expect(button.locator('svg.lucide-arrow-down-a-z')).toBeVisible();
			await expect.poll(() => isSorted(1)).toBe(true);

			await button.click();
			await expect(button.locator('svg.lucide-arrow-down-z-a')).toBeVisible();
			await expect.poll(() => isSorted(-1), { timeout: 3000 }).toBe(true);
		};

	test('sorts by station name', sortingTest('Station name', 1));
	test('sorts by district', sortingTest('District', 4));
	test('sorts by station type', sortingTest('Station type', 2));
	// KNOWN BUG: the metadata column reuses `accessorKey: 'id'`, so the ID column cannot be sorted
	// descending (the icon changes, the rows do not). Remove `test.fail` once fixed.
	test.fail('sorts by ID', sortingTest('ID', 3));

	test('search filters and highlights the stations', async ({ page }) => {
		await open(page, stationsUrl);
		const search = page.getByLabel('Search table');
		await search.fill('Barop');
		await expect(page).toHaveURL(/stationsSearch=Barop/);
		await expect(rows(page)).toHaveCount(1);
		await expect(rows(page).locator('span.bg-primary\\/50')).toHaveText(['Barop', 'Barop']);

		// the button next to the field clears the search
		await page.locator('#station-table-search button').click();
		await expect(search).toHaveValue('');
		await expect(rows(page)).toHaveCount(13);

		// and focuses the field while it is empty
		await search.blur();
		await page.locator('#station-table-search button').click();
		await expect(search).toBeFocused();
	});

	test('search matches station types and coordinates', async ({ page }) => {
		await open(page, appUrl('/en/stations', { ...closedSidebar, stationsSearch: 'Advanced' }));
		await expect(rows(page)).toHaveCount(13);
		await expect(rows(page).first()).toContainText('Advanced Station');

		await open(page, appUrl('/en/stations', { ...closedSidebar, stationsSearch: '51.484' }));
		await expect(rows(page)).toHaveCount(1);
		await expect(rows(page)).toContainText('Barop');
	});

	test('ctrl+k focuses the search', async ({ page }) => {
		await open(page, stationsUrl);
		await page.getByRole('heading', { name: 'Overview of all stations' }).click();
		await page.keyboard.press('ControlOrMeta+k');
		await expect(page.getByLabel('Search table')).toBeFocused();
	});
});

test.describe('station actions', () => {
	test.beforeEach(async ({ page }) => {
		await open(page, appUrl('/en/stations', { ...closedSidebar, stationsSearch: 'Barop' }));
		await expect(rows(page)).toHaveCount(1);
	});

	test('the coordinates link to google maps and can be copied', async ({
		page,
		context,
		browserName
	}) => {
		if (browserName === 'chromium') {
			await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		}
		await rows(page).locator('td:nth-child(5) button').click();
		await expect(
			page.getByRole('menuitem', { name: 'Open in Google Maps' }).locator('a')
		).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\?q=51\.48\d+,7\.43\d+$/);

		await page.getByRole('menuitem', { name: 'Copy to the clipboard' }).click();
		await expect(page.getByRole('menuitem', { name: 'Copied to the clipboard' })).toBeVisible();
		if (browserName === 'chromium') {
			expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
				/^51\.48\d+, 7\.43\d+$/
			);
		}
		// the confirmation resets after two seconds
		await expect(page.getByRole('menuitem', { name: 'Copy to the clipboard' })).toBeVisible({
			timeout: 5000
		});
	});

	test('the raw data can be downloaded', async ({ page, hasTouch }) => {
		const link = rows(page).locator('td:nth-child(6) a');
		await expect(link).toHaveAttribute('href', 'https://api.data2resilience.de/v1/download/DOTABS');
		await expect(link).toHaveAttribute('download', 'DOTABS.csv');
		// tapping the link on touch devices would start the download instead of showing a tooltip
		if (hasTouch) return;
		await revealTooltip(link);
		await expect(page.getByText('Download raw data for this station')).toBeVisible();
	});

	test('the metadata sheet opens in a new tab', async ({ page, context }) => {
		// the sheet is a page of the API (with its own CDN assets), not part of the dashboard
		await context.route('**/v1/stations/metadata/DOTABS', (route) =>
			route.fulfill({ contentType: 'text/html', body: '<h1>metadata sheet</h1>' })
		);
		const popupPromise = page.waitForEvent('popup');
		await rows(page).locator('td:nth-child(7) button').last().click();
		const popup = await popupPromise;
		await expect(popup).toHaveURL('https://api.data2resilience.de/v1/stations/metadata/DOTABS');
		await popup.close();
		await waitForUrlToSettle(page);
	});
});

test.describe('station descriptions', () => {
	test('describe both station types and their indicators', async ({ page }) => {
		await open(page, '/en/stations');
		const descriptions = page.locator('#sensor-descriptions > li');
		await expect(descriptions).toHaveCount(3);
		await expect(descriptions.nth(0)).toContainText('Advanced Stations');
		await expect(descriptions.nth(1)).toContainText('Basic Stations');

		await descriptions.nth(0).getByRole('button', { name: 'Know more' }).click();
		await expect(descriptions.nth(0)).toContainText('Supported indicators');
		await expect(descriptions.nth(0)).toContainText('Calculated indicators');
		await expect(descriptions.nth(0).getByRole('img')).toHaveAttribute(
			'alt',
			'Weather station with Blackglobe sensor'
		);
	});
});
