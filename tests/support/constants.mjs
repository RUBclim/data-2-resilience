// Shared by the Playwright config, the e2e fixtures and the SSR preload (plain ESM so node can
// `--import` it without a TS loader).
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * The frozen "now" of every replayed test (browser and SSR server).
 *
 * The raster archive of the API is rolling (~30 days), so when re-recording the
 * HARs (`pnpm test:e2e:record`) this has to be moved to a recent date that has
 * station *and* raster data. Moving it changes request URLs and screenshots, so
 * re-record, update the baselines and review the diff in one go.
 */
export const FIXED_NOW = '2026-10-19T14:00:00+02:00';
export const TIMEZONE = 'Europe/Berlin';

export const PORT = 4173;
export const BASE_URL = `http://localhost:${PORT}`;

/** every upstream the app talks to; anything else that is not localhost is blocked */
export const EXTERNAL_HOSTS = [
	'api.data2resilience.de',
	'geoweb1.digistadtdo.de',
	'tiles.basemaps.cartocdn.com',
	'www.wms.nrw.de'
];
export const EXTERNAL_URL_RE = new RegExp(
	`^https://(${EXTERNAL_HOSTS.map((h) => h.replaceAll('.', '\\.')).join('|')})/`
);

/**
 * The api answers "latest raster layer" requests with the newest layer at recording time, which
 * would make the heat atlas depend on when it was recorded. The browser (fixtures) and the SSR
 * server (ssr-preload) answer them with the layer of FIXED_NOW instead.
 */
const fixedNow = new Date(FIXED_NOW);
const LATEST_RASTER = {
	year: `${fixedNow.getUTCFullYear()}`,
	doy: `${(Date.UTC(fixedNow.getUTCFullYear(), fixedNow.getUTCMonth(), fixedNow.getUTCDate()) - Date.UTC(fixedNow.getUTCFullYear(), 0, 0)) / 86_400_000}`,
	hour: `${fixedNow.getUTCHours()}`.padStart(2, '0')
};
/** @param {URL} url */
export const isLatestRasterRequest = (url) =>
	EXTERNAL_URL_RE.test(url.href) &&
	url.pathname === '/tms/datasets' &&
	url.searchParams.get('limit') === '1';
/** @param {string} url */
export const latestRasterResponse = (url) => ({
	datasets: [{ ...LATEST_RASTER, param: new URL(url).searchParams.get('param') }],
	limit: 1,
	page: 0
});

export const RECORDINGS_DIR = path.join(ROOT_DIR, 'tests/e2e/recordings');
/** every upstream response of the browser, shared by all tests and projects */
export const UPSTREAM_HAR = path.join(RECORDINGS_DIR, 'upstream.har');
/** every upstream response of the SSR server */
export const SSR_RECORDINGS_FILE = path.join(RECORDINGS_DIR, 'ssr.json');
/** per-test HARs written while recording, merged into UPSTREAM_HAR afterwards (not checked in) */
export const RECORDING_TMP_DIR = path.join(ROOT_DIR, 'test-results/.recordings');
export const COVERAGE_DIR = path.join(ROOT_DIR, 'coverage');

/** `record` hits the real upstreams and writes recordings, `replay` only serves recordings */
export const RECORD = process.env.RECORD === '1';
