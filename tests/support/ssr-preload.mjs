// Preloaded into the adapter-node server (`node --import ./tests/support/ssr-preload.mjs build`).
//
// Playwright can only route requests made by the browser. The SvelteKit server also fetches
// from the API during SSR (src/routes/(pages)/+layout.server.ts), so this wraps the server's
// global fetch with the same record/replay semantics and freezes the server clock.
//
// NETWORK_MODE=record  forward upstream requests and store them in tests/e2e/recordings/ssr.json
// NETWORK_MODE=replay  serve stored responses only, unrecorded requests get a 599 (default)
// NETWORK_MODE=live    untouched fetch and real clock (integration tests)
import fs from 'node:fs';
import path from 'node:path';
import {
	EXTERNAL_URL_RE,
	FIXED_NOW,
	isLatestRasterRequest,
	latestRasterResponse,
	SSR_RECORDINGS_FILE
} from './constants.mjs';

const mode = process.env.NETWORK_MODE ?? 'replay';

if (!['record', 'replay', 'live'].includes(mode)) {
	throw new Error(`[ssr-preload] unknown NETWORK_MODE=${mode}`);
}

if (mode !== 'live') {
	freezeClock(new Date(FIXED_NOW).getTime());
	interceptFetch();
}
console.log(`[ssr-preload] NETWORK_MODE=${mode}`);

function freezeClock(fixedMs) {
	const RealDate = Date;
	class FrozenDate extends RealDate {
		constructor(...args) {
			if (args.length === 0) super(fixedMs);
			else super(...args);
		}
		static now() {
			return fixedMs;
		}
	}
	globalThis.Date = FrozenDate;
}

/** `METHOD url` -> { status, statusText, headers, body (base64) } */
function loadRecordings() {
	if (!fs.existsSync(SSR_RECORDINGS_FILE)) return {};
	return JSON.parse(fs.readFileSync(SSR_RECORDINGS_FILE, 'utf8'));
}

function interceptFetch() {
	const realFetch = globalThis.fetch;
	const recordings = loadRecordings();

	globalThis.fetch = async (input, init) => {
		const request = new Request(input, init);
		if (!EXTERNAL_URL_RE.test(request.url)) return realFetch(input, init);
		if (isLatestRasterRequest(new URL(request.url))) {
			return Response.json(latestRasterResponse(request.url));
		}
		const key = `${request.method} ${request.url}`;

		if (mode === 'record') {
			const response = await realFetch(request);
			const body = Buffer.from(await response.arrayBuffer());
			const recording = {
				status: response.status,
				statusText: response.statusText,
				headers: { 'content-type': response.headers.get('content-type') ?? '' },
				body: body.toString('base64')
			};
			recordings[key] = recording;
			// sorted keys keep the diff of a re-recording small
			const sorted = Object.fromEntries(
				Object.entries(recordings).sort(([a], [b]) => a.localeCompare(b))
			);
			fs.mkdirSync(path.dirname(SSR_RECORDINGS_FILE), { recursive: true });
			fs.writeFileSync(SSR_RECORDINGS_FILE, JSON.stringify(sorted, null, '\t') + '\n');
			return new Response(body, recording);
		}

		const recording = recordings[key];
		if (!recording) {
			console.error(
				`[ssr-preload] UNRECORDED server request ${key} – run \`pnpm test:e2e:record\``
			);
			return new Response('unrecorded request', { status: 599 });
		}
		return new Response(Buffer.from(recording.body, 'base64'), recording);
	};
}
