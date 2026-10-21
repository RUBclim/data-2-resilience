// read by vitest-monocart-coverage; scope is shared with the e2e collectors (see scripts/coverage.mjs)
import path from 'node:path';
import { COVERAGE_DIR } from './tests/support/constants.mjs';
import { sourceFilter, sourcePath } from './tests/support/coverage-options.mjs';

export default {
	name: 'vitest coverage',
	outputDir: path.join(COVERAGE_DIR, 'vitest'),
	reports: [['raw', { outputDir: 'raw' }], ['console-summary']],
	sourceFilter,
	sourcePath,
	logging: 'error'
};
