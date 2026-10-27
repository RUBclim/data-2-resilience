import { TinyColor } from '@ctrl/tinycolor';
import type { Page } from '@playwright/test';
import {
	appUrl,
	expect,
	featurePoint,
	open,
	revealTooltip,
	stationPoint,
	test,
	waitForMapIdle,
	waitForUrlToSettle
} from './support/fixtures';

// the sidebar covers (almost) the whole map on small screens
const closedSidebar = { sidebar: 'closed' };

const mapPopup = (page: Page) => page.locator('.maplibregl-popup');
const markers = (page: Page) => page.locator('.maplibregl-marker button');
// the aria-label of the trigger is not forwarded to the rendered button (asChild), hence the icon
const layersButton = (page: Page) => page.locator('button:has(svg.lucide-layers)');
const layerVisibility = (page: Page, layerId: string) =>
	page.evaluate((id) => window.__D2R_MAP__!.getLayoutProperty(id, 'visibility'), layerId);

async function toggleLayer(page: Page, name: string | RegExp) {
	await layersButton(page).click();
	await page.getByRole('menuitem', { name }).click();
	await page.keyboard.press('Escape');
}

test.describe('stations on the map', () => {
	test('hovering a station shows its current value', async ({ page, isMobile, hasTouch }) => {
		test.skip(isMobile || hasTouch, 'hover popup');
		await open(page, appUrl('/en', closedSidebar));
		const { x, y } = await stationPoint(page, 'DOBHBF');
		await page.mouse.move(x, y);
		await expect(mapPopup(page)).toContainText('Hauptbahnhof');
		await expect(mapPopup(page)).toContainText(/[\d.]+\s*°C/);
		await expect(mapPopup(page)).toContainText('No thermal stress');
	});

	test('hovering a basic station explains that it does not measure the indicator', async ({
		page,
		isMobile,
		hasTouch
	}) => {
		test.skip(isMobile || hasTouch, 'hover popup');
		await open(page, appUrl('/en', closedSidebar));
		const { x, y } = await stationPoint(page, 'DOTABA');
		await page.mouse.move(x, y);
		await expect(mapPopup(page)).toContainText('Westerfilde');
		await expect(mapPopup(page)).toContainText(
			'This station does not collect data for the indicator'
		);
	});

	test('hovering a station shows its category', async ({ page, isMobile, hasTouch }) => {
		test.skip(isMobile || hasTouch, 'hover popup');
		await open(page, appUrl('/en', { ...closedSidebar, unit: 'utci_category' }));
		const { x, y } = await stationPoint(page, 'DOBHBF');
		await page.mouse.move(x, y);
		await expect(mapPopup(page)).toContainText(/stress/i);
	});

	test('hovering a station without data says so', async ({ page, isMobile, hasTouch }) => {
		test.skip(isMobile || hasTouch, 'hover popup');
		await page.route('**/v1/network-snapshot?**', (route) =>
			route.fulfill({
				json: {
					data: [{ station_id: 'DOBHBF', utci: null, measured_at: '2026-10-19T12:00:00Z' }],
					visualization: { utci: null }
				}
			})
		);
		await open(page, appUrl('/en', closedSidebar));
		const { x, y } = await stationPoint(page, 'DOBHBF');
		await page.mouse.move(x, y);
		await expect(mapPopup(page)).toContainText('The station Hauptbahnhof has no data available');
	});

	test('clicking a station toggles its selection', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		const { x, y } = await stationPoint(page, 'DOBBHS');
		await page.mouse.click(x, y);
		await expect(page).toHaveURL(/selectedStations=DOBBHS%2CDOBHBF%2CDODFRP%2CDODGWS/);
		await waitForUrlToSettle(page);
		await page.mouse.click(x, y);
		await expect(page).toHaveURL(/selectedStations=DOBHBF%2CDODFRP%2CDODGWS/);
	});
});

test.describe('boundaries', () => {
	test('clicking a district shows its name until escape is pressed', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		const { x, y } = await featurePoint(page, 'districts', { avoid: ['stations'] });
		await page.mouse.click(x, y);
		await expect(mapPopup(page)).toContainText('City district');
		await page.keyboard.press('Escape');
		await expect(mapPopup(page)).toHaveCount(0);
	});

	test('neighborhoods and action areas can be shown instead', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		await toggleLayer(page, /Neighborhoods/);
		await expect(page).toHaveURL(/boundariesMode=lors/);
		await waitForMapIdle(page);

		const actionArea = await featurePoint(page, 'action-areas', { avoid: ['stations'] });
		const neighborhood = await featurePoint(page, 'lors', {
			where: 'return properties.vulnerable !== 1',
			avoid: ['action-areas', 'stations']
		});
		await page.mouse.click(actionArea.x, actionArea.y);
		await expect(mapPopup(page)).toContainText('Action area');

		// clicking the next feature replaces the popup
		await page.mouse.click(neighborhood.x, neighborhood.y);
		await expect(mapPopup(page)).toContainText('Neighborhood');
		await expect(mapPopup(page)).not.toContainText('Action area');

		// changing the boundaries closes open popups
		await toggleLayer(page, /Neighborhoods/);
		await expect(page).toHaveURL(/boundariesMode=none/);
		await expect(mapPopup(page)).toHaveCount(0);

		await toggleLayer(page, 'City districts');
		await expect(page).toHaveURL(/boundariesMode=districts/);
	});

	// KNOWN BUG (chromium): closing a popup with escape removes it behind svelte-maplibre's back, which then
	// swallows the next click on the map as "click outside". Remove `test.fail` once fixed.
	test('the first click after closing a popup with escape opens a popup', async ({
		page,
		browserName
	}) => {
		test.fail(browserName !== 'firefox', 'known bug in chromium');
		await open(page, appUrl('/en', closedSidebar));
		const district = await featurePoint(page, 'districts', { avoid: ['stations'] });
		await page.mouse.click(district.x, district.y);
		await expect(mapPopup(page)).toHaveCount(1);
		await page.keyboard.press('Escape');
		await expect(mapPopup(page)).toHaveCount(0);
		await page.mouse.click(district.x, district.y);
		await expect(mapPopup(page)).toHaveCount(1, { timeout: 2000 });
	});

	test('the districts can be hidden', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		await toggleLayer(page, 'City districts');
		await expect(page).toHaveURL(/boundariesMode=none/);
	});
});

test.describe('map layers', () => {
	test('satellite images replace the base map', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		const wmsTile = page.waitForResponse(/wms\.nrw\.de/);
		await toggleLayer(page, 'Digital Orthophotos');
		await expect(page).toHaveURL(/showSatellite=true/);
		await wmsTile;
		await waitForMapIdle(page);

		await toggleLayer(page, 'Digital Orthophotos');
		await expect(page).toHaveURL(/showSatellite=false/);
	});

	test('buildings and streets can be hidden and shown', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		// each toggle re-lays out the tiles; wait for that (KNOWN BUG, see the test.fail below)
		await toggleLayer(page, 'Buildings');
		await expect.poll(() => layerVisibility(page, 'building')).toBe('none');
		await waitForMapIdle(page);
		await toggleLayer(page, 'Streets');
		await expect.poll(() => layerVisibility(page, 'road_pri_case_noramp')).toBe('none');
		await waitForMapIdle(page);

		await toggleLayer(page, 'Buildings');
		await expect.poll(() => layerVisibility(page, 'building')).toBe('visible');
		await waitForMapIdle(page);
		await toggleLayer(page, 'Streets');
		await expect.poll(() => layerVisibility(page, 'road_pri_case_noramp')).toBe('visible');
	});

	// KNOWN BUG: Map.svelte only applies the buildings/streets visibility while `map.loaded()`, which
	// is false as long as tiles load (e.g. right after another layer was toggled): the toggle is
	// lost. Remove `test.fail` once fixed.
	test.fail('buildings can be hidden while the map loads tiles', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		let releaseTiles = () => {};
		const tilesReleased = new Promise<void>((resolve) => (releaseTiles = resolve));
		await page.route('**/openmaptiles/**', async (route) => {
			await tilesReleased;
			await route.fallback();
		});
		try {
			await page.getByRole('button', { name: 'Zoom in' }).click();
			await expect.poll(() => page.evaluate(() => window.__D2R_MAP__!.loaded())).toBe(false);
			await toggleLayer(page, 'Buildings');
			await expect.poll(() => layerVisibility(page, 'building'), { timeout: 3000 }).toBe('none');
		} finally {
			releaseTiles();
		}
	});

	test('the layer tooltips explain each layer', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		await layersButton(page).click();
		await revealTooltip(
			page.getByRole('menuitem', { name: 'City districts' }).locator('button:has(svg.lucide-info)')
		);
		await expect(page.getByText('official administrative divisions of Dortmund')).toBeVisible();
	});
});

test.describe('theme', () => {
	const styleName = (page: Page) => page.evaluate(() => window.__D2R_MAP__!.getStyle().name);
	const hasSatelliteLayer = (page: Page) =>
		page.evaluate(() =>
			window.__D2R_MAP__!.getStyle().layers.some((layer) => layer.id.includes('satellite'))
		);

	test('switching to dark mode restyles the map, also with satellite images', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		expect(await styleName(page)).toBe('Positron');

		await page.getByRole('button', { name: 'Toggle theme' }).click();
		await page.getByRole('menuitem', { name: 'Dark' }).click();
		await expect.poll(() => styleName(page)).toBe('Dark Matter');
		await waitForMapIdle(page);

		await toggleLayer(page, 'Digital Orthophotos');
		await expect(page).toHaveURL(/showSatellite=true/);
		await expect.poll(() => hasSatelliteLayer(page)).toBe(true);
		expect(await styleName(page)).toBe('Dark Matter');
		await waitForMapIdle(page);
	});

	test('wind directions are drawn in the muted color of the dark theme', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await open(page, appUrl('/en', { ...closedSidebar, unit: 'wind_direction' }));
		const colors = await page.evaluate(() =>
			window.__D2R_MAP__!.querySourceFeatures('stations').map((f) => f.properties?.color as string)
		);
		expect(colors).toContain(new TinyColor('#677489').lighten(15).toString());
	});
});

test.describe('console', () => {
	test('aborted requests are not reported as errors', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		const messages: string[] = [];
		page.on('console', (msg) => msg.type() === 'error' && messages.push(msg.text()));
		await page.evaluate(() => {
			console.error('AbortError: setTiles was aborted');
			console.error('AbortError', 'of something else');
			console.error('a real error');
		});
		await expect.poll(() => messages).toContain('a real error');
		expect(messages.filter((m) => m.includes('AbortError'))).toEqual([]);
	});
});

test.describe('zoom', () => {
	test('zooms in up to the maximum and out again', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		const zoomIn = page.getByRole('button', { name: 'Zoom in' });
		const zoom = () => page.evaluate(() => window.__D2R_MAP__!.getZoom());
		const initialZoom = await zoom();

		for (let i = 0; i < 6 && (await zoomIn.isEnabled()); i++) {
			await zoomIn.click();
			await waitForMapIdle(page);
		}
		await expect(zoomIn).toBeDisabled();
		expect(await zoom()).toBe(15.5);

		await page.getByRole('button', { name: 'Zoom out' }).click();
		await waitForMapIdle(page);
		await expect(zoomIn).toBeEnabled();
		expect(await zoom()).toBeGreaterThan(initialZoom);
		await expect(page).toHaveURL(/zoom=14\.5/);
	});

	test('the viewport is restored from the url', async ({ page }) => {
		await open(page, appUrl('/en', { ...closedSidebar, lat: 51.49, lng: 7.5, zoom: 13 }));
		const center = await page.evaluate(() => window.__D2R_MAP__!.getCenter().toArray());
		expect(center[0]).toBeCloseTo(7.5, 2);
		expect(center[1]).toBeCloseTo(51.49, 2);
	});
});

test.describe('address search', () => {
	const searchInput = (page: Page) => page.getByPlaceholder('Enter a location...');

	/**
	 * KNOWN BUG: MapSearchInput's initialisation effect resets the field on the first input, so the
	 * first keystroke is swallowed. Type one throw-away space, then enter the query as a single
	 * input event (one deterministic geocoder request). Works with and without that bug: a lone
	 * space is trimmed and never sent.
	 */
	async function typeSearch(page: Page, text: string) {
		await searchInput(page).click();
		await page.keyboard.press('Space');
		await searchInput(page).fill(text);
	}

	test.fail('pasting an address searches for it', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		await searchInput(page).fill('Friedensplatz');
		await expect(page.getByRole('option').first()).toBeVisible({ timeout: 3000 });
	});

	test('finds a place, shows a marker and clears it again', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		await typeSearch(page, 'Friedensplatz');
		const results = page.getByRole('option');
		await expect(results.first()).toBeVisible();
		// the typed query is written to the url debounced, with a stale copy of the query string
		await waitForUrlToSettle(page);
		const name = (await results.first().innerText()).trim();
		await results.first().click();

		await expect(page).toHaveURL(/map_search_coordinates=7\.465515-51\.511336/);
		await expect(searchInput(page)).toHaveValue(name);
		await expect(markers(page).first()).toBeVisible();
		await expect(markers(page).first()).toHaveAccessibleName(/Friedensplatz/);
		await markers(page).last().hover();
		await expect(page.getByText('You searched for the following place').last()).toBeVisible();

		// clear
		await waitForUrlToSettle(page);
		await page.locator('#map-search button:has(svg.lucide-arrow-left-to-line)').click();
		await expect(searchInput(page)).toHaveValue('');
		await expect(markers(page)).toHaveCount(0);
		await expect(page).toHaveURL(/map_search=(&|$)/);
	});

	// KNOWN BUG: the map stays where it is when a search result is picked, although Map.svelte
	// calls flyTo. Remove `test.fail` once fixed.
	test.fail('the map flies to the picked result', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		await typeSearch(page, 'Friedensplatz');
		await expect(page.getByRole('option').first()).toBeVisible();
		await waitForUrlToSettle(page);
		await page.getByRole('option').first().click();
		await expect(page).toHaveURL(/map_search_coordinates=7\.465515-51\.511336/);
		await expect
			.poll(() => page.evaluate(() => window.__D2R_MAP__!.getZoom()), { timeout: 5000 })
			.toBe(10);
	});

	test('the results can be picked with the keyboard', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		await page.locator('body').click({ position: { x: 5, y: 5 } });
		await page.keyboard.press('ControlOrMeta+k');
		await expect(searchInput(page)).toBeFocused();
		await page.keyboard.press('Space');
		await searchInput(page).fill('Rathaus');
		const results = page.getByRole('option');
		await expect(results.first()).toBeVisible();
		const count = await results.count();
		const names = (await results.allInnerTexts()).map((t) => t.trim());

		await waitForUrlToSettle(page);
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowUp');
		await page.keyboard.press('ArrowUp');
		// wrapped around to the last result and back to the first one
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowUp');
		await page.keyboard.press('Enter');
		await expect(searchInput(page)).toHaveValue(names[Math.min(count, 5) - 1]);
		await expect(page).toHaveURL(/map_search_coordinates=/);
	});

	test('escape and clicking outside close the results', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		await typeSearch(page, 'Rathaus');
		await expect(page.getByRole('option').first()).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('option')).toHaveCount(0);

		// focusing the field again re-opens the results
		await searchInput(page).blur();
		await searchInput(page).focus();
		await expect(page.getByRole('option').first()).toBeVisible();
		await page.getByRole('button', { name: 'Zoom out' }).click();
		await expect(page.getByRole('option')).toHaveCount(0);
	});

	test('tells when nothing was found', async ({ page }) => {
		await open(page, appUrl('/en', closedSidebar));
		await typeSearch(page, 'qwxyzqwxyz');
		await expect(page.getByText('No results found')).toBeVisible();
		await page.keyboard.press('Enter');
		await expect(page.getByText('No results found')).toBeVisible();
	});

	test('an unexpected answer of the geocoder counts as no results', async ({ page }) => {
		await page.route('**/geocoder/geosearch?**', (route) => route.fulfill({ json: { foo: 1 } }));
		await open(page, appUrl('/en', closedSidebar));
		await typeSearch(page, 'Dortmund');
		await expect(page.getByText('No results found')).toBeVisible();
	});

	test('tells when the search failed', async ({ page }) => {
		await page.route('**/geocoder/geosearch?**', (route) => route.fulfill({ status: 500 }));
		await open(page, appUrl('/en', closedSidebar));
		await typeSearch(page, 'Dortmund');
		await expect(page.getByText('An error occurred while searching for results')).toBeVisible({
			timeout: 30_000
		});
	});

	// a reload, shared link or language switch after a search
	test('restores a search from the url', async ({ page }) => {
		await open(
			page,
			appUrl('/en', {
				...closedSidebar,
				map_search: 'Somewhere',
				map_search_coordinates: '7.466-51.511'
			})
		);
		await expect(searchInput(page)).toHaveValue('Somewhere');
		await expect(markers(page).first()).toHaveAccessibleName('Somewhere');
	});
});
