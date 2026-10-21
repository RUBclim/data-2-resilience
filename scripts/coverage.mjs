// Merges the coverage of all test layers and enforces 100% on every metric:
//   coverage/vitest/raw  unit (node) + component (browser) tests   – pnpm test:unit
//   coverage/e2e/raw     e2e client code (chromium projects)        – pnpm test:e2e
//   coverage/server-v8   SSR server (NODE_V8_COVERAGE of the e2e web server)
import fs from 'node:fs';
import path from 'node:path';
import { CoverageReport } from 'monocart-coverage-reports';
import { COVERAGE_DIR, ROOT_DIR } from '../tests/support/constants.mjs';
import {
	outputFilter,
	SERVER_V8_COVERAGE_DIR,
	sourceFilter,
	sourcePath
} from '../tests/support/coverage-options.mjs';

/**
 * The coverage the suite reached (2026-10-21, no `v8 ignore` hints in the sources). A drop below
 * these values minus TOLERANCE fails the run; raise them when the coverage improves.
 *
 * `bytes` are the raw V8 block ranges mapped back onto the sources: every branch arm and function
 * body that never ran is an uncovered byte range. MCR derives statements/branches/functions from
 * the AST of each *generated* bundle (vitest dev transform, client build, SSR build), so these
 * three are lower than bytes/lines, but they are just as reproducible.
 */
const PINNED = { bytes: 99, lines: 98, statements: 82.74, branches: 69, functions: 95 };
/** percentage points: a few branches depend on timing (e.g. polling until an element exists) */
const TOLERANCE = 0.1;

// a local run writes coverage/{vitest,e2e,server-v8}; CI downloads each job's data to
// coverage/jobs/<job>/ (see .github/workflows/test.yml)
const JOBS_DIR = path.join(COVERAGE_DIR, 'jobs');
const coverageRoots = [
	COVERAGE_DIR,
	...(fs.existsSync(JOBS_DIR)
		? fs.readdirSync(JOBS_DIR).map((job) => path.join(JOBS_DIR, job))
		: [])
];
const existing = (dirs) => dirs.filter((dir) => fs.existsSync(dir));
const inputDir = existing(
	coverageRoots.flatMap((root) => [path.join(root, 'vitest/raw'), path.join(root, 'e2e/raw')])
);
const serverDirs = existing([
	SERVER_V8_COVERAGE_DIR,
	...coverageRoots.slice(1).map((root) => path.join(root, 'server-v8'))
]);

const report = new CoverageReport({
	name: 'Data2Resilience merged coverage',
	inputDir,
	outputDir: path.join(COVERAGE_DIR, 'merged'),
	// SSR chunks of the adapter-node build
	entryFilter: (entry) => !entry.url.startsWith('file://') || entry.url.includes('/build/server/'),
	sourceFilter,
	sourcePath,
	outputFilter,
	// report never-loaded files as 0% instead of silently ignoring them
	all: { dir: path.join(ROOT_DIR, 'src'), filter: { '**/*.{ts,svelte}': true } },
	// v8-json (coverage-report.json) carries the exact V8 ranges, e.g. for the "Monocart Coverage"
	// VSCode extension; lcov is not written because its line data is derived per bundle
	reports: [['v8'], ['v8-json'], ['console-summary'], ['console-details', { skipPercent: 100 }]],
	logging: 'error',
	onEnd: (results) => {
		const failures = Object.entries(PINNED).filter(
			([metric, pinned]) => results.summary[metric].pct < pinned - TOLERANCE
		);
		if (failures.length) {
			throw new Error(
				`coverage dropped: ${failures
					.map(([metric, pinned]) => `${metric} ${results.summary[metric].pct}% < ${pinned}%`)
					.join(', ')} – see coverage/merged/index.html`
			);
		}
	}
});

// addFromDir() goes through the cache, which MCR keeps between runs otherwise
report.cleanCache();
for (const dir of serverDirs) {
	await report.addFromDir(dir);
}

if (!inputDir.length && !serverDirs.length) {
	throw new Error('no coverage data found – run `pnpm test:unit` and `pnpm test:e2e` first');
}

await report.generate();
