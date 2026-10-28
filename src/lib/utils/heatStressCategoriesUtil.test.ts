import { describe, expect, it } from 'vitest';
import {
	getHeatStressCategoryByValue,
	getHeatStressValueByCategory,
	valueToCategoryMap
} from './heatStressCategoriesUtil';

describe('heatStressCategoriesUtil', () => {
	it('maps the ten category values to their names and back', () => {
		expect(valueToCategoryMap.size).toBe(10);
		for (const [value, category] of valueToCategoryMap) {
			expect(getHeatStressCategoryByValue(value)).toBe(category);
			expect(getHeatStressValueByCategory(category)).toBe(value);
		}
	});

	it('treats unknown values and categories as unknown', () => {
		expect(getHeatStressCategoryByValue(0)).toBe('unknown');
		expect(getHeatStressCategoryByValue('6')).toBe('unknown');
		expect(getHeatStressValueByCategory('lukewarm')).toBeUndefined();
	});
});
