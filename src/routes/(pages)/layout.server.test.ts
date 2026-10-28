import { afterEach, describe, expect, it, vi } from 'vitest';

const station = {
	id: 'DOBHBF',
	longName: 'Hauptbahnhof',
	latitude: 51.5,
	longitude: 7.4,
	stationType: 'biomet'
};
const mocks = vi.hoisted(() => ({ getStationsMetadata: vi.fn(), fetchStations: vi.fn() }));
vi.mock('#lib/utils/api.js', () => ({
	api: () => ({ getStationsMetadata: mocks.getStationsMetadata })
}));
vi.mock('#lib/stores/mapData.js', () => ({ fetchStations: mocks.fetchStations }));

const { load } = await import('./+layout.server');

const event = (search = '') =>
	({ locals: { locale: 'de' }, url: new URL(`http://localhost/de${search}`) }) as Parameters<
		typeof load
	>[0];

afterEach(() => vi.restoreAllMocks());

describe('root layout server load', () => {
	it('loads the stations and the selected station ids', async () => {
		const geoJson = { type: 'FeatureCollection', features: [{ id: 'DOBHBF' }] };
		mocks.fetchStations.mockResolvedValue(geoJson);
		mocks.getStationsMetadata.mockResolvedValue([station]);
		expect(await load(event('?selectedStations=DOBHBF,,DODFRP'))).toEqual({
			locale: 'de',
			stationsGeoJson: geoJson,
			stationsMetadata: [station],
			initialStationIds: ['DOBHBF', 'DODFRP']
		});
	});

	it('still renders without stations when the api fails', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		mocks.fetchStations.mockRejectedValue(new Error('api down'));
		mocks.getStationsMetadata.mockResolvedValue([station]);
		expect(await load(event())).toEqual({
			locale: 'de',
			stationsGeoJson: { type: 'FeatureCollection', features: [] },
			stationsMetadata: [],
			initialStationIds: []
		});
		expect(consoleError).toHaveBeenCalledWith(new Error('api down'));
	});
});
