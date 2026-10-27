import { createRequire } from 'node:module';
import path from 'node:path';

// The pre-commit hook (.pre-commit-config.yaml) runs prettier from its own node environment,
// without this project's node_modules (e.g. on pre-commit.ci). It lists that environment in
// NODE_PATH, which `import` ignores: resolve the plugins from there as a fallback.
const require = createRequire(import.meta.url);
const searchPaths = [
	import.meta.dirname,
	...(process.env.NODE_PATH ?? '').split(path.delimiter).filter(Boolean)
];
const plugin = (name) => require.resolve(name, { paths: searchPaths });

/** @type {import('prettier').Config} */
export default {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	plugins: [plugin('prettier-plugin-svelte'), plugin('prettier-plugin-tailwindcss')],
	// the theme (tailwind 4 has no js config) for the class order
	tailwindStylesheet: './src/app.css',
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte'
			}
		}
	]
};
