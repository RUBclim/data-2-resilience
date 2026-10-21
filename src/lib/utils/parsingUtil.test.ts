import { describe, expect, it } from 'vitest';
import { parseDatavisType, parseRawStationNameToId, parseStationMetadata } from './parsingUtil';

describe('parsingUtil', () => {
	it('renames the raw station metadata fields', () => {
		expect(
			parseStationMetadata({
				station_id: 'DOBHBF',
				long_name: 'Hauptbahnhof',
				station_type: 'biomet',
				latitude: 51.5
			} as Parameters<typeof parseStationMetadata>[0])
		).toEqual({ id: 'DOBHBF', longName: 'Hauptbahnhof', stationType: 'biomet', latitude: 51.5 });
	});

	it('renames station_id to id', () => {
		expect(parseRawStationNameToId({ station_id: 'DOBHBF' })).toEqual({ id: 'DOBHBF' });
		expect(parseRawStationNameToId({})).toEqual({ id: undefined });
	});

	it('parses the datavis type with "day" as fallback', () => {
		expect(parseDatavisType('hour')).toBe('hour');
		expect(parseDatavisType('range')).toBe('range');
		expect(parseDatavisType(undefined)).toBe('day');
		expect(parseDatavisType('week')).toBe('day');
	});
});
