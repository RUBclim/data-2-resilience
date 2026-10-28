import { LL } from '#lib/test-utils/i18n.js';
import { describe, expect, it } from 'vitest';
import {
	getHealthRiskByKey,
	getHealthRiskKeyByValue,
	getHealthRiskPill,
	getHealthRisksByUnit,
	getHealthRiskTitleKey,
	healthRisksRanges,
	isHealthRiskUnit,
	normalizeHealthRiskKey
} from './healthRisksUtil';

describe('health risk units', () => {
	it('are utci and pet with or without category', () => {
		for (const unit of ['utci', 'pet', 'UTCI_category', ' pet_category ']) {
			expect(isHealthRiskUnit(unit)).toBe(true);
		}
		expect(isHealthRiskUnit('air_temperature')).toBe(false);
	});

	it('use heat stress titles for categories and thermal comfort titles for values', () => {
		expect(getHealthRiskTitleKey('utci_category')).toBe('heatStress');
		expect(getHealthRiskTitleKey('utci')).toBe('thermalComfort');
	});

	it('merge slight into moderate heat stress', () => {
		expect(normalizeHealthRiskKey('slight heat stress')).toBe('moderate heat stress');
		expect(normalizeHealthRiskKey('strong heat stress')).toBe('strong heat stress');
	});
});

describe('getHealthRisksByUnit', () => {
	it('lists all ten utci risks with ranges', () => {
		const risks = getHealthRisksByUnit({ unit: 'utci', LL });
		expect(risks).toHaveLength(10);
		expect(risks[0]).toMatchObject({ key: 'extreme cold stress', ranges: 'below -40 °C' });
	});

	it('leaves out pet categories without a title', () => {
		expect(getHealthRisksByUnit({ unit: 'pet', LL }).length).toBeLessThanOrEqual(10);
	});

	it('is empty for other units', () => {
		expect(getHealthRisksByUnit({ unit: 'wind_speed', LL })).toEqual([]);
	});

	it('finds a single risk by key', () => {
		expect(getHealthRiskByKey({ key: 'no thermal stress', unit: 'utci', LL })?.title).toBe(
			'No thermal stress'
		);
		expect(getHealthRiskByKey({ key: 'nope', unit: 'utci', LL })).toBeUndefined();
	});
});

describe('getHealthRiskKeyByValue', () => {
	it('classifies utci and pet values by their ranges', () => {
		for (const [key, range] of Object.entries(healthRisksRanges)) {
			if (Number.isFinite(range.utci.min)) {
				expect(getHealthRiskKeyByValue({ unit: 'utci', value: range.utci.min })).toBe(
					normalizeHealthRiskKey(key)
				);
			}
		}
		expect(getHealthRiskKeyByValue({ unit: 'pet', value: 20 })).toBe('no thermal stress');
		expect(getHealthRiskKeyByValue({ unit: 'utci', value: -100 })).toBe('extreme cold stress');
	});

	it('passes category names through and resolves category numbers', () => {
		expect(getHealthRiskKeyByValue({ unit: 'utci', value: 'slight heat stress' })).toBe(
			'moderate heat stress'
		);
		expect(getHealthRiskKeyByValue({ unit: 'utci_category' as 'utci', value: 10 })).toBe(
			'extreme heat stress'
		);
		expect(getHealthRiskKeyByValue({ unit: 'pet_category' as 'pet', value: 1 })).toBe(
			'extreme cold stress'
		);
	});

	it('returns null without a value or for other units', () => {
		expect(getHealthRiskKeyByValue({ unit: 'utci', value: null })).toBeNull();
		expect(getHealthRiskKeyByValue({ unit: 'utci', value: undefined })).toBeNull();
		expect(getHealthRiskKeyByValue({ unit: 'wind_speed' as 'utci', value: 3 })).toBeNull();
	});
});

describe('getHealthRiskPill', () => {
	const pill = (value: number | string | null | undefined, unit = 'utci') =>
		getHealthRiskPill({ value, unit, LL, min: 0, max: 30, withLabel: true }).replace(/\s+/g, ' ');

	it('shows the risk of a value with its color', () => {
		expect(pill(20)).toContain('No thermal stress');
		expect(pill(20)).toContain('background-color:');
		expect(pill('strong heat stress', 'utci_category')).toContain('Strong heat stress');
	});

	it('has no label for unknown categories', () => {
		expect(pill('nope', 'utci_category')).not.toContain('stress');
	});

	it('describes missing and unsupported values', () => {
		expect(pill(null)).toContain('No data available');
		expect(pill(undefined)).toContain('Does not collect data');
		expect(pill(123, 'wind_direction')).toContain('Data available');
	});

	it('has no label for values outside every range and can hide the label', () => {
		expect(pill(5, 'air_temperature')).not.toContain('stress');
		expect(getHealthRiskPill({ value: 20, unit: 'utci', LL, min: 0, max: 30 })).not.toContain(
			'No thermal stress'
		);
	});
});
