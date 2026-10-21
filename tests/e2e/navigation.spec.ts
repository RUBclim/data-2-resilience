import type { Page } from '@playwright/test';
import { appUrl, expect, open, test, waitForMapIdle, waitForUrlToSettle } from './support/fixtures';

async function switchToGerman(page: Page) {
	await page
		.locator('#secondary-nav')
		.getByRole('button', { name: 'EN', exact: true })
		.first()
		.click();
	await page.getByRole('menuitem', { name: 'Deutsch' }).click();
}

test.describe('routing and i18n', () => {
	test.describe('with a German browser', () => {
		test.use({ locale: 'de-DE', extraHTTPHeaders: { 'Accept-Language': 'de-DE,de;q=0.9' } });

		test('/ redirects to the preferred locale', async ({ page }) => {
			await page.goto('/');
			await expect(page).toHaveURL(/\/de(\?|$)/);
			await expect(page.locator('html')).toHaveAttribute('lang', 'de');
			await expect(page.getByRole('heading', { name: 'Was wird gemessen?' })).toBeVisible();
		});
	});

	test('/ redirects english browsers to /en', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/en(\?|$)/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});

	test('the locale switcher changes the language', async ({ page }) => {
		await open(page, '/en/stations');
		await expect(page.getByRole('heading', { name: 'Overview of all stations' })).toBeVisible();

		await switchToGerman(page);
		await expect(page).toHaveURL(/\/de\/stations/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'de');
		await expect(
			page.getByRole('heading', { name: 'Alle Messstationen im Überblick' })
		).toBeVisible();
	});

	// KNOWN BUG (chromium): after switching the language, the LocaleSwitcher rewrites the history entries
	// with `replaceState`, so the back button never leads to the previous language again.
	// Remove `test.fail` once fixed.
	test.fail(
		'the back button returns to the previous language',
		async ({ page, isMobile, browserName }) => {
			test.skip(!!isMobile, 'only happens with the desktop layout (map viewport url updates)');
			test.skip(browserName === 'firefox', 'firefox only hits the bug sometimes');
			test.setTimeout(30_000);
			await open(page, '/en/stations');
			await switchToGerman(page);
			await waitForUrlToSettle(page);
			for (let i = 0; i < 5 && !page.url().includes('/en/'); i++) {
				await page.goBack();
				await waitForUrlToSettle(page);
			}
			await expect(page).toHaveURL(/\/en\/stations/, { timeout: 1000 });
		}
	);

	test('unknown pages show the 404 page', async ({ page }) => {
		await page.goto('/en/does-not-exist');
		await expect(page.getByRole('heading', { name: /404/ })).toBeVisible();
		await page.getByRole('link', { name: 'To the homepage' }).click();
		await expect(page).toHaveURL(/\/en(\?|$)/);
	});

	test('unknown locales fall back to the 404 page', async ({ page }) => {
		await page.goto('/xx/stations');
		await expect(page.getByRole('heading', { name: /404/ })).toBeVisible();
	});

	test('a page that fails to load shows the error page', async ({ page }) => {
		await open(page, '/en/stations');
		// the code of the next page cannot be loaded (e.g. after a deployment)
		await page.route('**/_app/immutable/nodes/*.js', (route) =>
			route.fulfill({ status: 500, body: '' })
		);
		await page.getByRole('link', { name: 'Measurements' }).click();
		await expect(page.getByRole('heading', { name: /500/ })).toBeVisible();
		await expect(page.getByText('Unexpected error')).toBeVisible();
		await expect(page.getByRole('link', { name: 'To the homepage' })).toBeVisible();
	});

	test('failing data of the root layout shows the fallback error page', async ({ page }) => {
		await open(page, '/en/stations');
		await page.route('**/__data.json*', (route) => route.fulfill({ status: 500, body: '{}' }));
		await page.getByRole('link', { name: 'Measurements' }).click();
		await expect(page.getByRole('heading', { name: /500/ })).toBeVisible();
		await expect(page.getByText('Internal Error')).toBeVisible();
	});
});

test.describe('header', () => {
	test('the about dialog opens from the header and closes back to the map', async ({ page }) => {
		await open(page, appUrl('/en', { unit: 'pet' }));
		// (an icon without text on narrow screens)
		await page.locator('#secondary-nav a[href*="/about"]').click();
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'About this dashboard' })).toBeVisible();
		await expect(page).toHaveURL(/\/en\/about\?.*unit=pet/);

		await dialog.getByRole('button', { name: 'Close' }).click();
		await expect(dialog).toBeHidden();
		await expect(page).toHaveURL(/\/en\?.*unit=pet/);
	});

	test('the theme switcher toggles dark, light and system mode', async ({ page }) => {
		await open(page, '/en/stations');
		const html = page.locator('html');
		const toggle = page.getByRole('button', { name: 'Toggle theme' });

		await toggle.click();
		await page.getByRole('menuitem', { name: 'Dark' }).click();
		await expect(html).toHaveClass(/dark/);

		await toggle.click();
		await page.getByRole('menuitem', { name: 'Light' }).click();
		await expect(html).not.toHaveClass(/dark/);

		await page.emulateMedia({ colorScheme: 'dark' });
		await toggle.click();
		await page.getByRole('menuitem', { name: 'System' }).click();
		await expect(html).toHaveClass(/dark/);
	});

	// KNOWN BUG: mode-watcher's `mode` is never empty, so "System" is never shown as selected.
	// Remove `test.fail` once fixed.
	test.fail('the theme menu highlights the system mode', async ({ page }) => {
		await open(page, '/en/stations');
		const toggle = page.getByRole('button', { name: 'Toggle theme' });
		await toggle.click();
		await page.getByRole('menuitem', { name: 'System' }).click();
		await toggle.click();
		await expect(
			page.getByRole('menuitem', { name: 'System' }).locator('span.font-semibold')
		).toBeVisible({ timeout: 2000 });
	});

	test('the about link collapses into an icon on narrow screens', async ({ page }) => {
		await page.setViewportSize({ width: 1024, height: 800 });
		await open(page, '/en/stations');
		const aboutLink = page.getByRole('link', { name: 'About this dashboard' });
		await expect(aboutLink).toBeVisible();

		await page.setViewportSize({ width: 400, height: 800 });
		await expect(aboutLink).toBeHidden();
		await expect(page.locator('#secondary-nav a[href*="/about"] svg')).toBeVisible();

		await page.setViewportSize({ width: 1024, height: 800 });
		await expect(aboutLink).toBeVisible();
	});
});

test.describe('left sidebar', () => {
	test('cycles through closed, simple and large on desktop', async ({ page, isMobile }) => {
		test.skip(!!isMobile, 'the large state only exists on desktop');
		await page.setViewportSize({ width: 1440, height: 900 });
		await open(page, '/en/stations');
		const sidebar = page.locator('#left-sidebar-wrapper');

		await page.getByRole('button', { name: 'Expand left sidebar' }).click();
		await expect(page).toHaveURL(/sidebar=large/);
		await expect
			.poll(() =>
				page.evaluate(() => document.documentElement.style.getPropertyValue('--leftSidebarWidth'))
			)
			.not.toBe('');

		await page.getByRole('button', { name: 'Collapse left sidebar' }).click();
		await expect(page).toHaveURL(/sidebar=closed/);
		await expect(sidebar).toHaveAttribute('inert');

		await page.getByRole('button', { name: 'Expand left sidebar' }).click();
		await expect(page).toHaveURL(/sidebar=simple/);
		await expect(sidebar).not.toHaveAttribute('inert');
	});

	test('falls back from large to simple when the screen gets narrow', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await open(page, appUrl('/en/stations', { sidebar: 'large' }));
		await expect(page.getByRole('button', { name: 'Collapse left sidebar' })).toBeVisible();

		await page.setViewportSize({ width: 800, height: 900 });
		await expect(page).toHaveURL(/sidebar=simple/);
		await expect(page.getByRole('button', { name: 'Collapse left sidebar' })).toBeVisible();

		// on mobile the sidebar toggles between closed and simple only
		await page.getByRole('button', { name: 'Collapse left sidebar' }).click();
		await expect(page).toHaveURL(/sidebar=closed/);
		await page.getByRole('button', { name: 'Expand left sidebar' }).click();
		await expect(page).toHaveURL(/sidebar=simple/);
	});

	test('the backdrop closes the sidebar on small screens', async ({ page }) => {
		await page.setViewportSize({ width: 600, height: 900 });
		await open(page, '/en/stations');
		await page.mouse.click(590, 450);
		await expect(page).toHaveURL(/sidebar=closed/);
	});

	test('the tab navigation gets a shadow while the sidebar is scrolled', async ({ page }) => {
		await open(page, '/en');
		const nav = page.locator('#navigation');
		const scrollContainer = page.locator('#left-sidebar-scroll-container');
		await expect(nav).not.toHaveClass(/shadow-2xl/);

		await scrollContainer.evaluate((el) => el.scrollTo({ top: 600 }));
		await expect(nav).toHaveClass(/shadow-2xl/);

		await scrollContainer.evaluate((el) => el.scrollTo({ top: 0 }));
		await expect(nav).not.toHaveClass(/shadow-2xl/);
	});

	test('the tabs navigate between the pages and keep the query string', async ({ page }) => {
		await open(page, appUrl('/en', { unit: 'air_temperature' }));
		await page.getByRole('link', { name: 'Heat atlas' }).click();
		await expect(page).toHaveURL(/\/en\/heat-stress\?.*unit=air_temperature/);
		// the map writes its viewport (debounced) once it has loaded on the new page; a stale write
		// would navigate back (KNOWN BUG: racing URL writers, see map.spec.ts)
		await waitForMapIdle(page);
		await waitForUrlToSettle(page);
		await page.getByRole('link', { name: 'Weather stations' }).click();
		await expect(page).toHaveURL(/\/en\/stations\?.*unit=air_temperature/);
		await waitForUrlToSettle(page);
		await page.getByRole('link', { name: 'Measurements' }).click();
		await expect(page).toHaveURL(/\/en\?.*unit=air_temperature/);
	});
});

test.describe('legal pages', () => {
	for (const [path, title] of [
		['/en/imprint', 'Imprint'],
		['/en/privacy-policy', 'Privacy Policy']
	] as const) {
		test(`${title} renders and links back home`, async ({ page }) => {
			await open(page, appUrl(path, { unit: 'pet' }));
			await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
			await page.getByRole('link', { name: 'Back to the homepage' }).click();
			await expect(page).toHaveURL(/\/en\?.*unit=pet/);
		});
	}
});

test.describe('config files', () => {
	test('robots.txt allows crawling', async ({ request }) => {
		const response = await request.get('/robots.txt');
		expect(response.headers()['content-type']).toBe('text/plain');
		const body = await response.text();
		expect(body).toContain('User-agent: *');
		expect(body).toMatch(/Disallow: \n/);
		expect(body).toContain('/sitemap.xml');
	});

	test('robots.txt points to the sitemap of the configured base url', async ({ request }) => {
		const body = await (await request.get('/robots.txt')).text();
		expect(body).toContain('Sitemap: http://localhost:4173/sitemap.xml');
	});

	test('canonical url uses the configured base url', async ({ page }) => {
		await page.goto('/en/stations');
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			/^http:\/\/localhost:4173\/en\/stations/
		);
	});

	test('sitemap.xml lists every page in both locales', async ({ request }) => {
		const response = await request.get('/sitemap.xml');
		expect(response.headers()['content-type']).toBe('application/xml');
		const body = await response.text();
		for (const slug of ['', 'heat-stress', 'stations', 'about', 'imprint', 'privacy-policy']) {
			expect(body).toContain(`<loc>http://localhost:4173/de/${slug}</loc>`);
			expect(body).toContain(`hreflang="en" href="http://localhost:4173/en/${slug}"`);
		}
	});

	test('manifest.json is valid json in the requested language', async ({ request }) => {
		const response = await request.get('/manifest.json');
		expect(response.headers()['content-type']).toBe('application/manifest+json');
		const manifest = await response.json();
		expect(manifest).toMatchObject({
			display: 'standalone',
			short_name: 'Data2Resilience',
			theme_color: '#eff3f8'
		});
	});
});
