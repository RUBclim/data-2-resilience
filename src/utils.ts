// Replaces the locale slug in a URL.
//
// If the `full` argument is set to `true`, the full URL is returned as a string.
// e.g. https://mywebsite.com/en/blog/article-1 => https://mywebsite.com/de/blog/article-1
//
// Otherwise (default) the URL relative to the base is returned.

type PageUrl = Pick<URL, 'pathname' | 'search' | 'href'>;

// The app is served from the root (no `paths.base`). SvelteKit 3 has no `base` export anymore, and
// `resolve('')` from `$app/paths` is no replacement: it is relative while rendering on the server.
const base = '';

// e.g. https://mywebsite.com/en/blog/article-1 => /de/blog/article-1
export const replaceLocaleInUrl = (url: PageUrl, locale: string, full = false): string => {
	const [, , ...rest] = getPathnameWithoutBase(url).split('/');
	const new_pathname = `/${[locale, ...rest].join('/')}`;
	if (!full) {
		return `${new_pathname}${url.search}`;
	}
	const newUrl = new URL(url.href);
	newUrl.pathname = base + new_pathname;
	return newUrl.toString();
};

// ----------------------------------------------------------------------------

const REGEX_START_WITH_BASE = new RegExp(`^${base}`);

export const getPathnameWithoutBase = (url: PageUrl) =>
	url.pathname.replace(REGEX_START_WITH_BASE, '');
