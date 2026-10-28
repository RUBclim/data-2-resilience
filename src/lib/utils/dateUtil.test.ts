import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isToday, limitDateBoundsToToday, today } from './dateUtil';

describe('dateUtil', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-19T14:30:00'));
	});
	afterEach(() => vi.useRealTimers());

	it('today() returns the current date', () => {
		expect(today()).toEqual(new Date('2026-10-19T14:30:00'));
	});

	it('isToday() compares by calendar day', () => {
		expect(isToday(new Date('2026-10-19T00:00:00'))).toBe(true);
		expect(isToday(new Date('2026-10-18T23:59:59'))).toBe(false);
	});

	describe('limitDateBoundsToToday', () => {
		it('keeps past dates at the requested hour', () => {
			const result = limitDateBoundsToToday({ date: new Date('2026-10-10T08:00:00'), hour: 5 });
			expect(result).toEqual(new Date('2026-10-10T05:00:00'));
		});

		it('defaults the hour to the hour of the given date', () => {
			const result = limitDateBoundsToToday({ date: new Date('2026-10-10T08:15:00') });
			expect(result).toEqual(new Date('2026-10-10T08:00:00'));
		});

		it('clamps future dates to the reference date', () => {
			const refDate = new Date('2026-10-19T14:30:00');
			const result = limitDateBoundsToToday({
				date: new Date('2026-10-19T00:00:00'),
				hour: 20,
				refDate
			});
			expect(result).toEqual(refDate);
		});
	});
});
