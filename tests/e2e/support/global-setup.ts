import { CoverageReport } from 'monocart-coverage-reports';
import fs from 'node:fs';
import {
	e2eClientCoverageOptions,
	SERVER_V8_COVERAGE_DIR
} from '../../support/coverage-options.mjs';

export default function globalSetup() {
	// start every run with empty coverage so stale data never inflates the numbers
	new CoverageReport(e2eClientCoverageOptions).cleanCache();
	fs.rmSync(SERVER_V8_COVERAGE_DIR, { recursive: true, force: true });
}
