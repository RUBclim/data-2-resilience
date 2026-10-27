import type { TranslationFunctions } from '#i18n/i18n-types.js';
import type { StationsGeoJSONType } from '#lib/stores/mapData.js';

export function getMessageForUnsupportedStations({
	ids,
	unsupportedIds,
	LL,
	unit,
	stations
}: {
	ids: string[];
	unsupportedIds: string[];
	LL: TranslationFunctions;
	unit: string;
	stations: StationsGeoJSONType['features'];
}) {
	if (unsupportedIds.length === 0) return null;
	const noneSupportedData = ids.length === unsupportedIds.length;
	const unitLongLabel =
		LL.pages.measurements.unitSelect.units[
			unit as keyof typeof LL.pages.measurements.unitSelect.units
		].label();

	if (noneSupportedData) {
		return LL.pages.measurements.allUnsupportedStations({
			unit: unitLongLabel
		});
	}

	const unsupportedDataStations = stations
		.filter((f) => unsupportedIds.includes(f.properties.id))
		.sort((a, b) => a.properties.longName.localeCompare(b.properties.longName));

	if (unsupportedIds.length === 1) {
		return LL.pages.measurements.singleUnsupportedStation({
			unit: unitLongLabel,
			station: unsupportedDataStations[0].properties.longName
		});
	}
	return LL.pages.measurements.someUnsupportedStations({
		unit: unitLongLabel,
		stations: unsupportedDataStations.map(({ properties }) => properties.longName).join(', ')
	});
}

export function getMessageForUnavailableStations({
	ids,
	unavailableIds,
	LL,
	unit,
	stations
}: {
	ids: string[];
	unavailableIds: string[];
	LL: TranslationFunctions;
	unit: string;
	stations: StationsGeoJSONType['features'];
}) {
	if (unavailableIds.length === 0) return null;
	const noneAvailableData = ids.length === unavailableIds.length;
	const unitLongLabel =
		LL.pages.measurements.unitSelect.units[
			unit as keyof typeof LL.pages.measurements.unitSelect.units
		].label();

	if (noneAvailableData) {
		return LL.pages.measurements.allStationsWithoutAvailableData({
			unit: unitLongLabel
		});
	}

	const unavailableDataStations = stations
		.filter((f) => unavailableIds.includes(f.properties.id))
		.sort((a, b) => a.properties.longName.localeCompare(b.properties.longName));

	if (unavailableIds.length === 1) {
		return LL.pages.measurements.singleStationWithoutAvailableData({
			unit: unitLongLabel,
			station: unavailableDataStations[0].properties.longName
		});
	}
	return LL.pages.measurements.someStationsWithoutAvailableData({
		unit: unitLongLabel,
		stations: unavailableDataStations.map(({ properties }) => properties.longName).join(', ')
	});
}
