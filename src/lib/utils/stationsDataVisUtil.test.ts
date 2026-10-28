import type { StationsGeoJSONType } from '$lib/stores/mapData';
import { LL } from '$lib/test-utils/i18n';
import { describe, expect, it } from 'vitest';
import {
	getMessageForUnavailableStations,
	getMessageForUnsupportedStations
} from './stationsDataVisUtil';

const station = (id: string, longName: string) =>
	({
		type: 'Feature',
		properties: { id, longName },
		geometry: { type: 'Point', coordinates: [0, 0] }
	}) as StationsGeoJSONType['features'][number];
const stations = [station('A', 'Zeche'), station('B', 'Altstadt'), station('C', 'Mitte')];
const ids = ['A', 'B', 'C'];
const unit = 'air_temperature';

describe.each([
	['unsupported', getMessageForUnsupportedStations, 'unsupportedIds', 'do not collect data'],
	['unavailable', getMessageForUnavailableStations, 'unavailableIds', 'have no available data']
] as const)('message for %s stations', (_, getMessage, key, someText) => {
	const message = (failing: string[]) =>
		getMessage({ ids, [key]: failing, LL, unit, stations } as never);

	it('is empty when all stations are fine', () => {
		expect(message([])).toBeNull();
	});

	it('names a single station', () => {
		expect(message(['B'])).toContain('<strong>Altstadt</strong>');
	});

	it('lists several stations alphabetically', () => {
		expect(message(['A', 'B'])).toContain(`<strong>Altstadt, Zeche</strong> ${someText}`);
	});

	it('summarises when no station is fine', () => {
		expect(message(ids)).toMatch(/^None of the selected stations/);
		expect(message(ids)).toContain('<strong>Air temperature</strong>');
	});
});
