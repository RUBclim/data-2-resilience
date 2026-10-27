import { LL } from '#lib/test-utils/i18n.js';
import { describe, expect, it } from 'vitest';
import {
	computeColormapRanges,
	getColorScaleValue,
	getColorStops,
	getColorsByUnit,
	unitsToScalesMap
} from './colorScaleUtil';

const muted = 'hsl(var(--muted))';

describe('computeColormapRanges', () => {
	const scale = unitsToScalesMap.air_temperature;

	it('uses the data range when it is wide enough', () => {
		expect(computeColormapRanges([2, 'x', null, 20], scale)).toEqual([2, 20]);
	});

	it('widens a too narrow range around the data', () => {
		expect(computeColormapRanges([10, 12], scale)).toEqual([8, 14]);
		expect(computeColormapRanges([10, 10], scale)).toEqual([7, 13]);
	});

	it('clamps to the 5th and 95th percentile', () => {
		expect(computeColormapRanges([-30, 50], scale)).toEqual([0, 24]);
	});
});

describe('getColorStops', () => {
	it('is uniformly muted without a value range', () => {
		const stops = [
			{ color: muted, position: 0 },
			{ color: muted, position: 100 }
		];
		expect(getColorStops({ unit: 'air_temperature', LL, min: null, max: 10 })).toEqual(stops);
		expect(getColorStops({ unit: 'utci', LL, min: 0, max: null })).toEqual(stops);
	});

	it('spreads the scheme of a unit evenly', () => {
		const stops = getColorStops({ unit: 'air_temperature', LL, min: 0, max: 20 });
		expect(stops).toHaveLength(10);
		expect(stops[0].position).toBe(0);
		expect(stops.at(-1)?.position).toBe(100);
	});

	it('uses the health risk categories in the range for utci', () => {
		const stops = getColorStops({ unit: 'utci', LL, min: 10, max: 30 });
		expect(stops.map((s) => s.position)).toEqual([0, 100]);
		const wide = getColorStops({ unit: 'utci', LL, min: -50, max: 50 });
		expect(wide.length).toBeGreaterThan(5);
		const pet = getColorStops({ unit: 'pet', LL, min: 0, max: 50 });
		expect(pet.length).toBeGreaterThan(2);
	});

	it('falls back to the default scheme for unknown units', () => {
		expect(getColorsByUnit({ unit: 'unknown', LL })).toEqual(unitsToScalesMap.default.scheme);
	});
});

describe('getColorScaleValue', () => {
	it('colors wind directions neutrally', () => {
		expect(getColorScaleValue({ unit: 'wind_direction', LL, value: 90, min: 0, max: 360 })).toBe(
			'hsl(var(--muted-foreground))'
		);
	});

	it('is muted without a value range', () => {
		expect(
			getColorScaleValue({ unit: 'air_temperature', LL, value: 5, min: null, max: null })
		).toBe(muted);
	});

	it('interpolates sequential units', () => {
		const low = getColorScaleValue({ unit: 'air_temperature', LL, value: 0, min: 0, max: 20 });
		const high = getColorScaleValue({ unit: 'air_temperature', LL, value: 20, min: 0, max: 20 });
		expect(low).toMatch(/^rgb\(/);
		expect(low).not.toBe(high);
	});

	it('colors categories and health risks by their category', () => {
		const category = getColorScaleValue({
			unit: 'utci_category',
			LL,
			value: 'strong heat stress',
			min: 0,
			max: 1
		});
		const value = getColorScaleValue({ unit: 'utci', LL, value: 35, min: 0, max: 40 });
		expect(category).toBe(value);
		expect(getColorScaleValue({ unit: 'utci', LL, value: 'nope', min: 0, max: 40 })).toBe(
			'hsl(var(--muted-foreground))'
		);
	});

	it('colors slight heat stress like moderate heat stress', () => {
		expect(
			getColorScaleValue({ unit: 'utci', LL, value: 'slight heat stress', min: 0, max: 1 })
		).toBe(getColorScaleValue({ unit: 'utci', LL, value: 'moderate heat stress', min: 0, max: 1 }));
	});

	it('uses an ordinal scale for other category units', () => {
		expect(getColorScaleValue({ unit: 'foo_category', LL, value: 'a', min: 0, max: 1 })).toBe(
			unitsToScalesMap.default.scheme[0]
		);
	});
});
