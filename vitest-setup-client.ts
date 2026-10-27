/// <reference types="vitest/browser" />
/// <reference types="@vitest/browser-playwright" />
// Component tests run without the SvelteKit client runtime: provide its modules and translations.
import { setLocale } from '#i18n/i18n-svelte.js';
import { loadAllLocales } from '#i18n/i18n-util.sync.js';
import { vi } from 'vitest';
import './src/app.css';

// `$app/env/public` inlines the static variables (src/env.ts), but destructures the dynamic ones
// from this global of the SvelteKit dev runtime
Object.assign(globalThis, { __sveltekit_dev: { env: {} } });

vi.mock('$app/env', () => ({
	browser: true,
	dev: false,
	building: false,
	version: 'test'
}));
vi.mock('$app/navigation', () => ({
	goto: vi.fn(async () => {}),
	invalidateAll: vi.fn(async () => {}),
	refreshAll: vi.fn(async () => {})
}));
vi.mock('$app/state', async () => ({
	page: (await import('#lib/test-utils/page.svelte.js')).page,
	navigating: { current: null },
	updated: { current: false }
}));

loadAllLocales();
setLocale('en');
