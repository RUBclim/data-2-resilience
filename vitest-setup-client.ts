/// <reference types="vitest/browser" />
/// <reference types="@vitest/browser-playwright" />
// Component tests run without the SvelteKit client runtime: provide its modules and translations.
import { setLocale } from '$i18n/i18n-svelte';
import { loadAllLocales } from '$i18n/i18n-util.sync';
import { vi } from 'vitest';
import './src/app.css';

vi.mock('$app/environment', () => ({
	browser: true,
	dev: false,
	building: false,
	version: 'test'
}));
vi.mock('$app/navigation', () => ({
	goto: vi.fn(async () => {}),
	invalidateAll: vi.fn(async () => {})
}));
vi.mock('$app/stores', async () => {
	const { readable, writable } = await import('svelte/store');
	const page = writable({
		url: new URL('http://localhost/en'),
		params: { lang: 'en' },
		status: 200
	});
	return { page, navigating: readable(null), updated: readable(false) };
});

loadAllLocales();
setLocale('en');
