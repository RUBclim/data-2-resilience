import { CoverageReport } from 'monocart-coverage-reports';
import { mergeRecordings } from '../../../scripts/merge-recordings.mjs';
import { RECORD } from '../../support/constants.mjs';
import { e2eClientCoverageOptions } from '../../support/coverage-options.mjs';

export default async function globalTeardown() {
	if (RECORD) {
		const { recorded, total } = mergeRecordings();
		console.log(`[recordings] merged ${recorded} recorded requests, ${total} in upstream.har`);
	}
	// turn the per-test coverage cache into raw data for scripts/coverage.mjs (chromium only;
	// a firefox-only run collects nothing)
	const report = new CoverageReport(e2eClientCoverageOptions);
	if (report.hasCache()) await report.generate();
}
