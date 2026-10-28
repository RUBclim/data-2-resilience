import { setLocale } from '#i18n/i18n-svelte.js';
import { loadAllLocales } from '#i18n/i18n-util.sync.js';
import { get } from 'svelte/store';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// the query param stores read the url of the SvelteKit page state
vi.mock('$app/env', () => ({ browser: false, building: false, dev: false, version: '' }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', async () => ({
	page: (await import('#lib/test-utils/page.svelte.js')).page
}));

const { page } = await import('#lib/test-utils/page.svelte.js');
const openUrl = (search: string) => (page.url = new URL(`http://localhost/en?${search}`));

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
