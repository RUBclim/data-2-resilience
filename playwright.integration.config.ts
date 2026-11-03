import { defineConfig, devices } from '@playwright/test';
import { PORT, TIMEZONE } from './tests/support/constants.mjs';

/**
 * The geocoder (geoweb1.digistadtdo.de) answers 403 to an Origin/Referer of `localhost:<port>`,
 * so the live run uses 127.0.0.1. The vector tiles are served by the test build itself from
 * PUBLIC_VITE_BASE_URL, which therefore has to be the same host (`pnpm build:test:integration`).
 */
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * Live integration test (same port as the e2e suite, so do not run both at the same time): the
 * real API, raster tile server, geocoder and basemap hosts, real time.
 * Runs nightly in CI (and via `pnpm test:integration`) against `pnpm build:test:integration`.
 */
export default defineConfig({
	testDir: 'tests/integration',
	retries: process.env.CI ? 2 : 0,
	timeout: 120_000,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
	expect: { timeout: 30_000 },
	use: {
		baseURL: BASE_URL,
		timezoneId: TIMEZONE,
		locale: 'en-US',
		trace: 'retain-on-failure'
	},
	projects: [
		{
			name: 'chromium-desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }
		}
	],
	webServer: {
		command: 'node --import ./tests/support/ssr-preload.mjs build/index.js',
		url: BASE_URL,
		reuseExistingServer: false,
		timeout: 30_000,
		env: { PORT: String(PORT), ORIGIN: BASE_URL, TZ: TIMEZONE, NETWORK_MODE: 'live' }
	}
});
