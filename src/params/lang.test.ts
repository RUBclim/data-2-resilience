import { describe, expect, it } from 'vitest';
import { match } from './lang';

describe('lang param matcher', () => {
	it('only accepts the supported locales', () => {
		expect(match('de')).toBe(true);
		expect(match('en')).toBe(true);
		expect(match('fr')).toBe(false);
		expect(match('')).toBe(false);
	});
});
