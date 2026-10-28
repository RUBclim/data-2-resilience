import { handleErrorWithSentry, replayIntegration } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import {
	PUBLIC_SENTRY_DSN,
	PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
	PUBLIC_SENTRY_SESSION_SAMPLE_RATE,
	PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE
} from '$app/env/public';

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,

	tracesSampleRate: Number(PUBLIC_SENTRY_TRACES_SAMPLE_RATE),

	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: Number(PUBLIC_SENTRY_SESSION_SAMPLE_RATE),

	// If the entire session is not sampled, use the below sample rate to sample
	// sessions when an error occurs.
	replaysOnErrorSampleRate: Number(PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE),

	// If you don't want to use Session Replay, just remove the line below:
	integrations: [
		replayIntegration({ useCompression: false, maskAllText: false, blockAllMedia: false })
	],
	// tunnel the errors so we avoid ad blockers
	tunnel: '/sentry-tunnel'
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
