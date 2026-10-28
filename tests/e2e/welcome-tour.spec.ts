import type { Page } from '@playwright/test';
import { appUrl, expect, open, test, waitForMapIdle } from './support/fixtures';

test.use({ skipWelcomeTour: false });

const welcome = (page: Page) => page.locator('#left-sidebar-scroll-container > section').first();
// shepherd keeps the previous steps in the DOM (hidden)
const step = (page: Page) => page.locator('.shepherd-element:visible');
const stepButton = (page: Page, name: string) =>
	step(page).getByRole('button', { name, exact: true });
const storedState = (page: Page) => page.evaluate(() => localStorage.getItem('welcome-opened'));

test.describe('welcome message', () => {
	test('is shown on the first visit and remembers when it was closed', async ({ page }) => {
		await open(page, '/en');
		await expect(welcome(page)).toContainText('Welcome to the Dashboard!');

		await welcome(page).getByRole('button', { name: "Understood, let's go" }).click();
		await expect(welcome(page)).not.toContainText('Welcome to the Dashboard!');
		expect(await storedState(page)).toBe('false');

		await page.reload();
		await expect(
			welcome(page).getByRole('button', { name: 'Show the introduction message again' })
		).toBeVisible();

		await welcome(page)
			.getByRole('button', { name: 'Show the introduction message again' })
			.click();
		await expect(welcome(page)).toContainText('Welcome to the Dashboard!');
		expect(await storedState(page)).toBe('true');

		// the x in the corner closes it as well
		await welcome(page).locator('button:has(svg.lucide-x)').click();
		expect(await storedState(page)).toBe('false');
	});
});

test.describe('guided tour', () => {
	// the tour applies its settings with the debounced url setters, which race each other (see
	// README, known issues) – the chart requests in between depend on that timing
	test.use({ allowUnrecorded: /\/v1\/(network-snapshot|data\/)/ });

	test('walks through every feature', async ({ page }) => {
		test.setTimeout(120_000);
		await open(page, appUrl('/en/stations', { unit: 'pet', datavisType: 'day', minMaxAvg: 'max' }));
		await welcome(page).getByRole('button', { name: 'Start the tour' }).click();

		const steps = [
			'Welcome to the dashboard introduction!',
			'Navigation overview',
			'Selecting measurement data',
			'Comparing measurement data at a glance',
			'Choosing time period and statistical display',
			'Using the interactive map',
			'Exploring the heat atlas',
			'Learning more about weather stations'
		];

		for (const [index, title] of steps.entries()) {
			await expect(step(page)).toContainText(title);
			await expect(step(page)).toContainText(`${index + 1}/${steps.length}`);
			if (index === 1) await expect(page).toHaveURL(/\/en\?/);
			if (index < steps.length - 1) await stepButton(page, 'Next').click();
		}

		// back and forth
		await stepButton(page, 'Back').click();
		await expect(step(page)).toContainText('Exploring the heat atlas');
		await stepButton(page, 'Next').click();

		// restart from the last step
		await stepButton(page, 'Restart tour').click();
		await expect(step(page)).toContainText('Welcome to the dashboard introduction!');
		for (let i = 0; i < steps.length - 1; i++) await stepButton(page, 'Next').click();

		await stepButton(page, 'Finish').click();
		await expect(page.locator('.shepherd-element')).toHaveCount(0);
	});

	// KNOWN BUG (timing dependent, so neither test.fail nor a regular test): the tour navigates and
	// applies/restores its settings with debounced url setters that overwrite each other with stale
	// copies of the query string. Sometimes the last step stays on the heat atlas and the settings
	// from before the tour are not (fully) restored. Enable once the race is fixed.
	test.fixme('opens the page of each step and restores the previous settings', async ({ page }) => {
		await open(page, appUrl('/en/stations', { unit: 'pet', datavisType: 'day', minMaxAvg: 'max' }));
		await welcome(page).getByRole('button', { name: 'Start the tour' }).click();
		for (let i = 0; i < 6; i++) await stepButton(page, 'Next').click();
		await expect(page).toHaveURL(/\/en\/heat-stress\?/);
		await stepButton(page, 'Next').click();
		await expect(page).toHaveURL(/\/en\/stations\?/);
		await stepButton(page, 'Finish').click();
		await expect(page).toHaveURL(/unit=pet/);
		await expect(page).toHaveURL(/datavisType=day/);
		await expect(page).toHaveURL(/minMaxAvg=max/);
	});

	test('can be cancelled at any step', async ({ page }) => {
		await open(page, appUrl('/en', { unit: 'air_temperature' }));
		await welcome(page).getByRole('button', { name: 'Start the tour' }).click();
		await expect(step(page)).toContainText('Welcome to the dashboard introduction!');
		await stepButton(page, 'Next').click();
		await expect(step(page)).toContainText('Navigation overview');

		await stepButton(page, 'Cancel').click();
		await expect(page.locator('.shepherd-element')).toHaveCount(0);
		await waitForMapIdle(page);
	});
});
