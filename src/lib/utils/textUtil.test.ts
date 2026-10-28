import { LL } from '$lib/test-utils/i18n';
import { describe, expect, it } from 'vitest';
import { getHeatStressLabel, sortUnitByLabel } from './textUtil';

describe('getHeatStressLabel', () => {
	it('returns the title of a health risk category', () => {
		expect(getHeatStressLabel({ unit: 'utci_category', LL, value: 'strong heat stress' })).toBe(
			'Strong heat stress'
		);
	});

	it('returns an empty string for unknown categories and non health units', () => {
		expect(getHeatStressLabel({ unit: 'utci', LL, value: 'nope' })).toBe('');
		expect(getHeatStressLabel({ unit: 'air_temperature', LL, value: 'strong heat stress' })).toBe(
			''
		);
	});
});

describe('sortUnitByLabel', () => {
	const unit = (value: string, label: string) => ({ value, label });

	it('sorts utci units first, shortest label first', () => {
		const units = [
			unit('air_temperature', 'Air temperature'),
			unit('utci_category', 'UTCI category (long)'),
			unit('dew_point', 'Dew point'),
			unit('utci', 'UTCI')
		];
		expect(units.sort((a, b) => sortUnitByLabel(a, b, 'en')).map((u) => u.value)).toEqual([
			'utci',
			'utci_category',
			'air_temperature',
			'dew_point'
		]);
	});
});
