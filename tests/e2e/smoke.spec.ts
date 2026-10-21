import { expect, test, waitForMapIdle } from './support/fixtures';

test('measurements page renders stations from the API on the map', async ({ page }) => {
	await page.goto('/en');
	await expect(page.getByRole('heading', { name: 'What is being measured?' })).toBeVisible();
	await waitForMapIdle(page);
	const stationCount = await page.evaluate(
		() => window.__D2R_MAP__!.querySourceFeatures('stations-outer-rings').length
	);
	expect(stationCount).toBeGreaterThan(0);
});
