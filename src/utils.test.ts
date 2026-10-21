import { describe, expect, it } from 'vitest';
import { getPathnameWithoutBase, replaceLocaleInUrl } from './utils';

describe('replaceLocaleInUrl', () => {
	const url = new URL('https://example.org/en/stations?unit=pet');

	it('returns the relative url with the new locale', () => {
		expect(replaceLocaleInUrl(url, 'de')).toBe('/de/stations?unit=pet');
	});

	it('returns the full url with the new locale', () => {
		expect(replaceLocaleInUrl(url, 'de', true)).toBe('https://example.org/de/stations?unit=pet');
	});

	it('works for the locale root', () => {
		expect(replaceLocaleInUrl(new URL('https://example.org/en'), 'de')).toBe('/de');
	});
});

describe('getPathnameWithoutBase', () => {
	it('returns the pathname (no base path configured)', () => {
		expect(getPathnameWithoutBase(new URL('https://example.org/en/about'))).toBe('/en/about');
	});
});
