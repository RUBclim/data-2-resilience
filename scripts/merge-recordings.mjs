// Merges the per-test HARs of a recording run (test-results/.recordings) into the one HAR that
// all tests replay (tests/e2e/recordings/upstream.har). Runs automatically at the end of
// `pnpm test:e2e:record`; can also be run by hand: `node scripts/merge-recordings.mjs`.
//
// - one entry per request (method + url); entries of the existing recording are kept unless they
//   were recorded again
// - responses faked by the tests themselves (`route.fulfill`) are dropped: unlike real servers they
//   never send a `Date` header
// - volatile fields (timings, dates, caching headers) are dropped, so re-recordings diff cleanly
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { FIXED_NOW, RECORDING_TMP_DIR, UPSTREAM_HAR } from '../tests/support/constants.mjs';

const VOLATILE_HEADERS = new Set([
	'age',
	'cf-cache-status',
	'cf-ray',
	'date',
	'etag',
	'expires',
	'last-modified',
	'nel',
	'report-to',
	'server-timing',
	'via',
	'x-amz-cf-id',
	'x-amz-cf-pop',
	'x-cache'
]);

/**
 * @typedef {{ name: string, value: string }} Header
 * @typedef {{
 *   request: { method: string, url: string, httpVersion: string },
 *   response: {
 *     status: number, statusText: string, httpVersion: string, headers: Header[],
 *     content: { text?: string }, redirectURL?: string
 *   }
 * }} Entry
 */

/** @param {Entry} entry */
const key = (entry) => `${entry.request.method} ${entry.request.url}`;

/** @param {Entry} entry */
const isUpstreamResponse = (entry) =>
	entry.response.status > 0 &&
	entry.response.headers.some(({ name }) => name.toLowerCase() === 'date');

/** @param {Entry} entry */
const bodySize = (entry) => entry.response.content.text?.length ?? 0;

/** the fields routeFromHAR needs, in a stable form */
/** @param {Entry} entry */
const normalize = (entry) => ({
	startedDateTime: new Date(FIXED_NOW).toISOString(),
	time: 0,
	request: {
		method: entry.request.method,
		url: entry.request.url,
		httpVersion: entry.request.httpVersion,
		cookies: [],
		headers: [],
		queryString: [],
		headersSize: -1,
		bodySize: -1
	},
	response: {
		status: entry.response.status,
		statusText: entry.response.statusText,
		httpVersion: entry.response.httpVersion,
		cookies: [],
		headers: entry.response.headers.filter(({ name }) => !VOLATILE_HEADERS.has(name.toLowerCase())),
		content: entry.response.content,
		redirectURL: entry.response.redirectURL ?? '',
		headersSize: -1,
		bodySize: -1
	},
	cache: {},
	timings: { send: 0, wait: 0, receive: 0 }
});

/**
 * @param {string} dir
 * @returns {Generator<string>}
 */
function* harFiles(dir) {
	if (!fs.existsSync(dir)) return;
	for (const item of fs
		.readdirSync(dir, { withFileTypes: true })
		.sort((a, b) => a.name.localeCompare(b.name))) {
		const file = path.join(dir, item.name);
		if (item.isDirectory()) yield* harFiles(file);
		else if (item.name.endsWith('.har')) yield file;
	}
}

export function mergeRecordings() {
	/** @type {Map<string, Entry>} */
	const recorded = new Map();
	for (const file of harFiles(RECORDING_TMP_DIR)) {
		for (const entry of JSON.parse(fs.readFileSync(file, 'utf8')).log.entries) {
			if (!isUpstreamResponse(entry)) continue;
			const existing = recorded.get(key(entry));
			// keep the first recording, unless it was cut short (e.g. an empty body)
			if (!existing || bodySize(existing) < bodySize(entry)) {
				recorded.set(key(entry), normalize(entry));
			}
		}
	}

	/** @type {Map<string, Entry>} */
	const entries = new Map();
	if (fs.existsSync(UPSTREAM_HAR)) {
		for (const entry of JSON.parse(fs.readFileSync(UPSTREAM_HAR, 'utf8')).log.entries) {
			entries.set(key(entry), entry);
		}
	}
	for (const [k, entry] of recorded) entries.set(k, entry);

	const har = {
		log: {
			version: '1.2',
			creator: { name: 'scripts/merge-recordings.mjs', version: '1' },
			pages: [],
			entries: [...entries.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, e]) => e)
		}
	};
	fs.mkdirSync(path.dirname(UPSTREAM_HAR), { recursive: true });
	fs.writeFileSync(UPSTREAM_HAR, JSON.stringify(har, null, '\t') + '\n');
	return { recorded: recorded.size, total: entries.size };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const { recorded, total } = mergeRecordings();
	console.log(`merged ${recorded} recorded requests, ${total} in ${UPSTREAM_HAR}`);
}
