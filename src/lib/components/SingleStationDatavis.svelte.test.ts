import { page } from '#lib/test-utils/page.svelte.js';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SingleStationDatavis from './SingleStationDatavis.svelte';

const selectUnit = (unit: string) => (page.url = new URL(`http://localhost/en?unit=${unit}`));

describe('SingleStationDatavis', () => {
	afterEach(() => (page.url = new URL('http://localhost/en')));

	it('shows a placeholder while loading', async () => {
		const screen = await render(SingleStationDatavis, {
			isLoading: true,
			label: undefined,
			value: undefined,
			min: null,
			max: null
		});
		expect(screen.container.querySelector('.animate-pulse')).not.toBeNull();
	});

	it('shows a color dot for categories', async () => {
		selectUnit('utci_category');
		const screen = await render(SingleStationDatavis, {
			isLoading: false,
			label: 'Strong heat stress',
			value: 'strong heat stress',
			min: null,
			max: null
		});
		await expect.element(screen.getByText('Strong heat stress')).toBeVisible();
		expect(screen.container.querySelector('strong .rounded-full')).not.toBeNull();
	});

	it('shows the health risk of pet values', async () => {
		selectUnit('pet');
		const screen = await render(SingleStationDatavis, {
			isLoading: false,
			label: '25',
			value: 25,
			min: 10,
			max: 30
		});
		await expect.element(screen.getByText('Moderate heat stress')).toBeVisible();
	});

	it('shows no health risk for other indicators', async () => {
		selectUnit('air_temperature');
		const screen = await render(SingleStationDatavis, {
			isLoading: false,
			label: '21',
			value: 21,
			min: 10,
			max: 30
		});
		await expect.element(screen.getByText(/21\s+°C/)).toBeVisible();
		expect(screen.container.querySelector('p')).toBeNull();
	});
});
