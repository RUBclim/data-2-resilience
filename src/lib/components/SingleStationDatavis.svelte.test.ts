import { page } from '$app/stores';
import type { Writable } from 'svelte/store';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SingleStationDatavis from './SingleStationDatavis.svelte';

const pageStore = page as unknown as Writable<{ url: URL }>;
const selectUnit = (unit: string) =>
	pageStore.set({ url: new URL(`http://localhost/en?unit=${unit}`) });

describe('SingleStationDatavis', () => {
	afterEach(() => pageStore.set({ url: new URL('http://localhost/en') }));

	it('shows a placeholder while loading', async () => {
		const screen = await render(SingleStationDatavis, {
			isLoading: true,
			label: undefined,
			value: undefined
		});
		expect(screen.container.querySelector('.animate-pulse')).not.toBeNull();
	});

	it('shows a color dot for categories', async () => {
		selectUnit('utci_category');
		const screen = await render(SingleStationDatavis, {
			isLoading: false,
			label: 'Strong heat stress',
			value: 'strong heat stress'
		});
		await expect.element(screen.getByText('Strong heat stress')).toBeVisible();
		expect(screen.container.querySelector('strong .rounded-full')).not.toBeNull();
	});

	it('shows the health risk of pet values', async () => {
		selectUnit('pet');
		const screen = await render(SingleStationDatavis, { isLoading: false, label: '25', value: 25 });
		await expect.element(screen.getByText('Moderate heat stress')).toBeVisible();
	});

	it('shows no health risk for other indicators', async () => {
		selectUnit('air_temperature');
		const screen = await render(SingleStationDatavis, { isLoading: false, label: '21', value: 21 });
		await expect.element(screen.getByText(/21\s+°C/)).toBeVisible();
		expect(screen.container.querySelector('p')).toBeNull();
	});
});
