import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SENTRY_DSN: { public: true, static: true },
	PUBLIC_SENTRY_TRACES_SAMPLE_RATE: { public: true, static: true },
	PUBLIC_SENTRY_SESSION_SAMPLE_RATE: { public: true, static: true },
	PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE: { public: true, static: true },
	PUBLIC_ENABLE_HEATATLAS_TIMESLIDER: { public: true, static: true },
	PUBLIC_VITE_BASE_URL: { public: true, static: true },
	PUBLIC_API_BASE_URL: { public: true, static: true },
	PUBLIC_GEOCODING_URL: { public: true, static: true }
});
