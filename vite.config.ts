import { sentrySvelteKit } from '@sentry/sveltekit/vite';
import nodeAdapter from '@sveltejs/adapter-node';
import vercelAdapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// unit tests assert on dates around midnight/DST: run them in the timezone of the e2e tests
if (process.env.VITEST) process.env.TZ = 'Europe/Berlin';

export default defineConfig(({ mode }) => ({
	build: {
		sourcemap: true,
		// the coverage of the e2e tests is mapped back to the sources: unminified code maps exactly
		minify: mode !== 'test'
	},
	plugins: [
		sentrySvelteKit({
			// test builds (`vite build --mode test`) and vitest must never upload source maps
			autoUploadSourceMaps: mode !== 'test',
			// the generated load() wrappers map onto the route files and would show up as
			// uncoverable code; with the empty test DSN they are no-ops anyway
			autoInstrument: mode !== 'test',
			org: 'rubclim',
			project: 'd2r-dashboard'
		}),
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			// the docker image runs the node server, everything else is deployed to vercel
			adapter: process.env.IS_DOCKER ? nodeAdapter() : vercelAdapter()
		})
	],
	test: {
		expect: { requireAssertions: true },
		// generous: importing the hooks/i18n and the browser tests are slow on a busy machine
		testTimeout: 20_000,
		coverage: {
			enabled: true,
			// vitest cleans this directory – keep it away from the e2e coverage in ./coverage
			reportsDirectory: './coverage/vitest',
			include: ['src/**'],
			provider: 'custom',
			customProviderModule: 'vitest-monocart-coverage/browser'
		},
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
}));
