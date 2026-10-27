import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, PORT, RECORD, TIMEZONE } from './tests/support/constants.mjs';
import { SERVER_V8_COVERAGE_DIR } from './tests/support/coverage-options.mjs';

const desktop = { viewport: { width: 1440, height: 900 } };

// Rendering the map with a software WebGL renderer takes most of the CPU time of the suite.
// Outside the pinned docker image screenshots are not compared, so `PW_GPU=1` lets local runs
// render on the GPU of the machine instead (chromium only, needs a Vulkan driver).
const gpu = !!process.env.PW_GPU && !process.env.PW_DOCKER && !process.env.CI;
const chromiumWebGL = gpu
	? { launchOptions: { args: ['--use-angle=vulkan', '--enable-features=Vulkan'] } }
	: {};

// headless firefox has WebGL disabled by default; force the mesa llvmpipe software renderer
// (headless firefox does not get any faster on the GPU)
const firefoxWebGL = {
	launchOptions: {
		firefoxUserPrefs: { 'webgl.force-enabled': true },
		env: { ...process.env, LIBGL_ALWAYS_SOFTWARE: '1', MOZ_WEBGL_FORCE_EGL: '1' }
	}
};

export default defineConfig({
	testDir: 'tests/e2e',
	globalSetup: './tests/e2e/support/global-setup.ts',
	globalTeardown: './tests/e2e/support/global-teardown.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	// replay is deterministic; recording talks to real services and may hit a hiccup
	retries: RECORD ? 2 : 0,
	// CI runs one browser project per job (.github/workflows/test.yml)
	workers: process.env.CI ? '75%' : undefined,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
	timeout: 60_000,

	// Screenshots are only reproducible in the pinned docker image (fonts, WebGL rasterizer),
	// so baselines are created/compared there only (`pnpm test:e2e:docker`, CI).
	ignoreSnapshots: !process.env.CI && !process.env.PW_DOCKER,
	snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
	expect: {
		timeout: 15_000,
		toHaveScreenshot: {
			maxDiffPixels: 0,
			threshold: 0.1,
			animations: 'disabled',
			caret: 'hide',
			scale: 'css'
		}
	},

	use: {
		baseURL: BASE_URL,
		timezoneId: TIMEZONE,
		locale: 'en-US',
		colorScheme: 'light',
		trace: 'retain-on-failure',
		// a recorded run must not depend on anything that was cached by a previous test
		serviceWorkers: 'block'
	},

	projects: [
		{
			name: 'chromium-desktop',
			use: { ...devices['Desktop Chrome'], ...desktop, ...chromiumWebGL }
		},
		{
			name: 'firefox-desktop',
			use: { ...devices['Desktop Firefox'], ...desktop, ...firefoxWebGL }
		},
		{ name: 'chromium-mobile', use: { ...devices['Pixel 7'], ...chromiumWebGL } },
		{
			name: 'firefox-mobile',
			// firefox does not support `isMobile`
			use: {
				...devices['Desktop Firefox'],
				...firefoxWebGL,
				viewport: { width: 390, height: 844 },
				hasTouch: true
			}
		}
	],

	webServer: {
		command: 'node --import ./tests/support/ssr-preload.mjs build/index.js',
		url: BASE_URL,
		reuseExistingServer: false,
		timeout: 30_000,
		stdout: 'pipe',
		gracefulShutdown: { signal: 'SIGTERM', timeout: 10_000 },
		env: {
			PORT: String(PORT),
			ORIGIN: BASE_URL,
			TZ: TIMEZONE,
			NETWORK_MODE: RECORD ? 'record' : 'replay',
			NODE_V8_COVERAGE: SERVER_V8_COVERAGE_DIR
		}
	}
});
