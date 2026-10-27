import type { Handle } from '@sveltejs/kit/hooks';
import type { RequestEvent } from '@sveltejs/kit';

// @ts-expect-error kit's internal entry points have no type declarations of their own
import { with_request_store as withRequestStore } from '@sveltejs/kit/internal/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const with_request_store = withRequestStore as <T>(
	store: { event: RequestEvent; state: object },
	fn: () => T
) => T;

vi.mock('@sentry/sveltekit', () => ({
	init: vi.fn(),
	sentryHandle:
		() =>
		async ({ event, resolve }: { event: RequestEvent; resolve: Resolve }) =>
			resolve(event),
	handleErrorWithSentry: () => vi.fn()
}));

type Resolve = (event: RequestEvent, opts?: ResolveOptions) => Promise<Response>;
type ResolveOptions = {
	transformPageChunk?: (input: { html: string; done: boolean }) => string | Promise<string>;
};

function requestEvent(path: string, headers: Record<string, string> = {}) {
	const url = new URL(`http://localhost:4173${path}`);
	return {
		url,
		request: new Request(url, { headers }),
		locals: {},
		fetch: vi.fn(async () => new Response('proxied', { status: 202 }))
	} as unknown as RequestEvent & { fetch: ReturnType<typeof vi.fn> };
}

/** resolves like sveltekit: renders a page through the transformPageChunk option */
const resolve = vi.fn(async (_event: RequestEvent, opts?: ResolveOptions) => {
	const html = await opts?.transformPageChunk?.({ html: '<html lang="%lang%">', done: true });
	return new Response(html ?? 'resolved');
});
const resolveHook = resolve as unknown as Parameters<Handle>[0]['resolve'];
/** `sequence()` hands each hook a copy of the event: the locals end up on the resolved one */
const resolvedEvent = () => resolve.mock.calls[0][0];

/**
 * calls the hook like the sveltekit server does: `sequence()` reads the request store, so the
 * hook has to run inside one (tracing disabled, as without `experimental.tracing`)
 */
function runHandle(handle: Handle, event: RequestEvent) {
	const state = { tracing: { record_span: ({ fn }: { fn: (span: object) => unknown }) => fn({}) } };
	return with_request_store({ event, state }, () => handle({ event, resolve: resolveHook }));
}

afterEach(() => {
	vi.resetModules();
	vi.doUnmock('$app/env/public');
	resolve.mockClear();
});

describe('handle', () => {
	it('redirects to the preferred locale without a locale in the url', async () => {
		const { handle } = await import('./hooks.server');
		for (const [language, locale] of [
			['de-DE,de;q=0.9', 'de'],
			['en-US,en;q=0.9', 'en'],
			['fr-FR', 'de']
		]) {
			await expect(
				runHandle(handle, requestEvent('/', { 'accept-language': language }))
			).rejects.toMatchObject({ status: 307, location: `/${locale}` });
		}
	});

	it('binds the locale of the url and sets the html lang attribute', async () => {
		const { handle } = await import('./hooks.server');
		const event = requestEvent('/en/stations', { 'accept-language': 'de' });
		const response = await runHandle(handle, event);
		const { locals } = resolvedEvent();
		expect(locals.locale).toBe('en');
		expect(locals.LL.siteNameShort()).toBe('Data2Resilience');
		expect(await response.text()).toBe('<html lang="en">');
	});

	it('uses the preferred locale for urls without a locale (e.g. endpoints)', async () => {
		const { handle } = await import('./hooks.server');
		const event = requestEvent('/manifest.json', { 'accept-language': 'en' });
		await runHandle(handle, event);
		expect(resolvedEvent().locals.locale).toBe('en');
	});

	it('does not proxy sentry without a dsn', async () => {
		const { handle } = await import('./hooks.server');
		const event = requestEvent('/sentry-tunnel', { origin: 'http://localhost:4173' });
		await runHandle(handle, event);
		expect(event.fetch).not.toHaveBeenCalled();
		expect(resolve).toHaveBeenCalled();
	});

	it('tunnels sentry envelopes when a dsn is configured', async () => {
		vi.doMock('$app/env/public', async (importOriginal) => ({
			...(await importOriginal<object>()),
			PUBLIC_SENTRY_DSN: 'https://public-key@o123.ingest.sentry.io/456'
		}));
		const { handle } = await import('./hooks.server');
		const event = requestEvent('/sentry-tunnel', { origin: 'http://localhost:4173' });
		const response = await runHandle(handle, event);

		expect(response.status).toBe(202);
		const [url, init] = event.fetch.mock.calls[0] as [string, RequestInit];
		expect(url).toBe('https://o123.ingest.sentry.io/api//456/envelope/');
		const headers = new Headers(init.headers);
		expect(headers.get('x-sentry-auth')).toBe('Sentry sentry_version=7, sentry_key=public-key');
		expect(headers.get('content-type')).toBe('application/x-sentry-envelope');
		expect(resolve).not.toHaveBeenCalled();
	});
});

describe('handleError', () => {
	it('is the sentry error handler', async () => {
		const { handleError } = await import('./hooks.server');
		expect(handleError).toEqual(expect.any(Function));
	});
});
