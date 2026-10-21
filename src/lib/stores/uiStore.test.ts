import { setLocale } from '$i18n/i18n-svelte';
import { loadAllLocales } from '$i18n/i18n-util.sync';
import type { Writable } from 'svelte/store';
import { get } from 'svelte/store';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// the query param stores read the url of the SvelteKit page store
vi.mock('$app/environment', () => ({ browser: false, building: false, dev: false, version: '' }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/stores', async () => {
	const { writable } = await import('svelte/store');
	return { page: writable({ url: new URL('http://localhost/en') }) };
});

const { page } = (await import('$app/stores')) as unknown as {
	page: Writable<{ url: URL }>;
};
const openUrl = (search: string) => page.set({ url: new URL(`http://localhost/en?${search}`) });

beforeAll(() => {
	loadAllLocales();
	setLocale('en');
});

afterEach(() => {
	vi.useRealTimers();
});

describe('unitWithoutCategory', () => {
	it('is pet for pet indicators and utci otherwise', async () => {
		const { unitWithoutCategory } = await import('./uiStore');
		openUrl('unit=pet_category');
		expect(get(unitWithoutCategory)).toBe('pet');
		openUrl('unit=air_temperature');
		expect(get(unitWithoutCategory)).toBe('utci');
	});
});

describe('formattedTimeConfiguration', () => {
	it('names both years of a time range across new year', async () => {
		vi.useFakeTimers({ now: new Date('2026-01-05T14:00:00+01:00'), toFake: ['Date'] });
		const { formattedTimeConfiguration } = await import('./uiStore');
		openUrl('datavisType=range&range_start=-10&range_end=0');
		expect(get(formattedTimeConfiguration)).toBe('26th December 2025 - 5th January 2026');
	});
});
