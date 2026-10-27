import { describe, expect, it } from 'vitest';
import { params } from './params';

const matches = (param: string) => !('issues' in params.lang['~standard'].validate(param));

describe('lang param matcher', () => {
	it('only accepts the supported locales', () => {
		expect(matches('de')).toBe(true);
		expect(matches('en')).toBe(true);
		expect(matches('fr')).toBe(false);
		expect(matches('')).toBe(false);
	});
});
