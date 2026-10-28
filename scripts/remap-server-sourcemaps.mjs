// adapter-node bundles .svelte-kit/adapter-node/** into build/server/** a second time, and its
// sourcemaps only point to those intermediate files. Compose both levels so the SSR coverage
// (NODE_V8_COVERAGE of the e2e web server) maps back to src/. Runs after `pnpm build:test`.
import remapping from '@ampproject/remapping';
import fs from 'node:fs';
import path from 'node:path';

const BUILD_SERVER_DIR = path.resolve('build/server');
const ADAPTER_DIR = path.resolve('.svelte-kit/adapter-node');
// adapter-node copied the vite output (and its maps) from here into ADAPTER_DIR, one directory
// level shallower – so the relative `sources` of the copied maps have to be resolved from here
const VITE_SERVER_DIR = path.resolve('.svelte-kit/output/server');

let count = 0;
for (const file of fs.readdirSync(BUILD_SERVER_DIR, { recursive: true })) {
	if (!file.endsWith('.js.map')) continue;
	const mapPath = path.join(BUILD_SERVER_DIR, file);
	const mapDir = path.dirname(mapPath);
	const composed = remapping(fs.readFileSync(mapPath, 'utf8'), (source) => {
		const intermediate = path.resolve(mapDir, `${source}.map`);
		if (!source.includes('.svelte-kit/adapter-node/') || !fs.existsSync(intermediate)) return null;
		const map = JSON.parse(fs.readFileSync(intermediate, 'utf8'));
		const originalDir = path.join(
			VITE_SERVER_DIR,
			path.relative(ADAPTER_DIR, path.dirname(path.resolve(mapDir, source)))
		);
		map.sources = map.sources.map((s) => path.resolve(originalDir, map.sourceRoot ?? '', s));
		delete map.sourceRoot;
		return map;
	});
	fs.writeFileSync(mapPath, composed.toString());
	count++;
}
console.log(`remapped ${count} server sourcemaps`);
