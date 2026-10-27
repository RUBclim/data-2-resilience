import * as Sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN, PUBLIC_SENTRY_TRACES_SAMPLE_RATE } from '$app/env/public';

// sveltekit loads this before the app code, so sentry can instrument the node server from the
// start. The dev server re-runs it on every ssr reload, while the client lives on in a global:
// initialize only once per process
if (!Sentry.isInitialized()) {
	Sentry.init({
		dsn: PUBLIC_SENTRY_DSN,
		tracesSampleRate: Number(PUBLIC_SENTRY_TRACES_SAMPLE_RATE)
	});
}
