import { get } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StationMetadata } from '#lib/utils/schemas.js';

const getStationsMetadata = vi.hoisted(() => vi.fn());
vi.mock('#lib/utils/api.js', () => ({ api: () => ({ getStationsMetadata }) }));
const { fetchStations, filterDoubleStations, stations } = await import('./mapData');

const station = (id: string, stationType: string, longName = 'Bolmke', lat = 51.48) =>
	({ id, longName, latitude: lat, longitude: 7.44, stationType }) as StationMetadata;

afterEach(() => vi.clearAllMocks());

describe('filterDoubleStations', () => {
	it('drops a double station at the same place as another station', () => {
		const biomet = station('DOBBOL', 'biomet');
		expect(filterDoubleStations([biomet, station('DODBOL', 'double')])).toEqual([biomet]);
	});

	it('keeps double stations that stand on their own', () => {
		const double = station('DODBOL', 'double');
		const other = station('DOBHBF', 'biomet', 'Hauptbahnhof', 51.51);
		expect(filterDoubleStations([double, other])).toEqual([double, other]);
	});

	it('keeps the later of two regular stations at the same place', () => {
		const later = station('B', 'temprh');
		expect(filterDoubleStations([station('A', 'temprh'), later])).toEqual([later]);
	});
});

describe('fetchStations', () => {
	it('converts the stations to geojson and stores them', async () => {
		getStationsMetadata.mockResolvedValue([
			station('DOBBOL', 'biomet'),
			station('DODBOL', 'double')
		]);
		const geoJson = await fetchStations();
		expect(geoJson.features).toEqual([
			{
				id: 'DOBBOL',
				type: 'Feature',
				properties: station('DOBBOL', 'biomet'),
				geometry: { type: 'Point', coordinates: [7.44, 51.48] }
			}
		]);
		expect(get(stations)).toBe(geoJson);
	});
});
