import { redirect, type RequestEvent } from '@sveltejs/kit';
import { sequence, type Handle } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Locales } from '#i18n/i18n-types.js';
import { detectLocale, i18n, isLocale } from '#i18n/i18n-util.js';
import { loadAllLocales } from '#i18n/i18n-util.sync.js';
import { initAcceptLanguageHeaderDetector } from 'typesafe-i18n/detectors';
import { getPathnameWithoutBase } from './utils.js';
import { PUBLIC_SENTRY_DSN } from '$app/env/public';
import { handleProxies } from '@kitql/handles';

// Sentry.init() is in instrumentation.server.ts
loadAllLocales();
const L = i18n();

const SENTRY_URL = PUBLIC_SENTRY_DSN ? new URL(PUBLIC_SENTRY_DSN) : null;
const SENTRY_HOST = SENTRY_URL?.host ?? null;
const SENTRY_PROJECT_ID = SENTRY_URL?.pathname ?? null;
const SENTRY_KEY = SENTRY_URL?.username ?? null;
const SENTRY_UPSTREAM_URL =
	SENTRY_HOST && SENTRY_PROJECT_ID
		? `https://${SENTRY_HOST}/api/${SENTRY_PROJECT_ID}/envelope/`
		: null;

const proxies = SENTRY_UPSTREAM_URL
	? handleProxies([
			[
				'/sentry-tunnel',
				{
					to: SENTRY_UPSTREAM_URL,
					requestHook: (event) => {
						const request = event.request.clone();
						// https://develop.sentry.dev/sdk/data-model/envelopes/#authentication
						request.headers.set(
							'X-Sentry-Auth',
							`Sentry sentry_version=7, sentry_key=${SENTRY_KEY}`
						);
						// https://develop.sentry.dev/sdk/data-model/envelopes/#http-headers
						request.headers.set('Content-Type', 'application/x-sentry-envelope');
						return request;
					}
				}
			]
		])
	: async ({ event, resolve }: Parameters<Handle>[0]) => {
			return resolve(event);
		};

export const handle: Handle = sequence(
	Sentry.sentryHandle(),
	proxies,
	async ({ event, resolve }) => {
		// read language slug
		const [, lang] = getPathnameWithoutBase(event.url).split('/');

		// redirect to base locale if no locale slug was found
		if (!lang) {
			const locale = getPreferredLocale(event);

			throw redirect(307, `/${locale}`);
		}

		// if slug is not a locale, use base locale (e.g. api endpoints)
		const locale = isLocale(lang) ? (lang as Locales) : getPreferredLocale(event);
		const LL = L[locale];

		// bind locale and translation functions to current request
		event.locals.locale = locale;
		event.locals.LL = LL;

		// replace html lang attribute with correct language
		return resolve(event, { transformPageChunk: ({ html }) => html.replace('%lang%', locale) });
	}
);

const getPreferredLocale = ({ request }: RequestEvent) => {
	// detect the preferred language the user has configured in his browser
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
	const acceptLanguageDetector = initAcceptLanguageHeaderDetector(request);

	return detectLocale(acceptLanguageDetector);
};
export const handleError = Sentry.handleErrorWithSentry();
