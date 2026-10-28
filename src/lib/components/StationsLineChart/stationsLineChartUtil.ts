import type { StationsGeoJSONType } from '#lib/stores/mapData.js';
import { api } from '#lib/utils/api.js';
import { limitDateBoundsToToday } from '#lib/utils/dateUtil.js';
import { normalizeHealthRiskKey } from '#lib/utils/healthRisksUtil.js';
import { getHeatStressValueByCategory } from '#lib/utils/heatStressCategoriesUtil.js';
import type { WeatherMeasurementKeyNoMinMax } from '#lib/utils/schemas.js';
import { compareAsc, format, isValid, parseISO } from 'date-fns';

type ParsedValueType = {
	id: string;
	measured_at?: string;
	value: string;
};

export const getStationDataFetcher =
	({
		ids,
		start_date,
		end_date,
		unit,
		stations
	}: {
		ids: string[];
		start_date?: Date;
		end_date?: Date;
		unit: string | null;
		stations: StationsGeoJSONType['features'];
	}) =>
	async () => {
		const idsInStations = ids.filter((id) => stations.find((f) => f.properties.id === id));
		if (idsInStations.length === 0 || !start_date || !end_date || !unit) return;
		const promises = idsInStations.map(async (id) => {
			const start = limitDateBoundsToToday({
				date: start_date,
				hour: 0
			});
			const end = limitDateBoundsToToday({
				date: end_date,
				hour: 23
			});
			const itemResults = await api().getStationData({
				id,
				start_date: start,
				end_date: end,
				param: unit as unknown as WeatherMeasurementKeyNoMinMax,
				scale: 'hourly'
			});

			if (itemResults === null) return { id, supported: false, dataAvailable: false };
			const data = mapStationDataResults({ id, unit, results: itemResults });
			return {
				supported: true,
				dataAvailable: data.some((d) => d.value !== null),
				data
			};
		});

		const results = (await Promise.all(promises)) as PromiseResult<ParsedValueType>[];
		const onlyWithSupported = results
			.filter((item) => notEmptyAndNotUnsupported(item) && !supportedAndWithUnavailableData(item))
			.map(({ data }) => data)
			.flat();
		const onlyUnsupported = results
			.filter((item) => !notEmptyAndNotUnsupported(item))
			.flat()
			.map(({ id }) => id)
			.filter(notEmpty);
		const onlyUnavailable = Array.from(
			new Set(
				results
					.filter(supportedAndWithUnavailableData)
					.flatMap(({ data }) => (Array.isArray(data) ? data : []).map(({ id }) => id))
					.filter(notEmpty)
			)
		);

		return {
			lineChartData: mapDataToLayerChartData({
				unit,
				data: onlyWithSupported,
				stations
			}),
			unsupportedIds: onlyUnsupported,
			unavailableIds: onlyUnavailable
		};
	};

type PromiseResult<T> =
	{ id: string; supported: false } | { supported: true; data: T; id: undefined };
function notEmptyAndNotUnsupported<T>(
	item: PromiseResult<T>
): item is { supported: true; data: T; id: undefined } {
	if ('supported' in item && item.supported) return notEmpty(item.data);
	return false;
}

function supportedAndWithUnavailableData<T>(
	item: PromiseResult<T>
): item is { supported: true; data: T; id: undefined } {
	if ('supported' in item && item.supported && Array.isArray(item.data)) {
		const allNull = item.data.every((d) => d.value === null);
		return allNull;
	}
	return false;
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined;
}

function mapStationDataResults<
	T extends (Record<string, unknown> & {
		measured_at?: string;
	})[]
>({ id, unit, results = [] as unknown as T }: { id: string; unit: string; results?: T }) {
	return results.map((i) => {
		const value = i[unit as keyof typeof i] as string;
		return {
			id,
			measured_at: i.measured_at,
			value: normalizeHealthRiskKey(value)
		} satisfies ParsedValueType;
	});
}

type CombinedLayerChartDataItem = {
	date: Date;
} & {
	[K in string]: K extends 'date' ? Date : string | null;
};

function mapDataToLayerChartData({
	unit,
	data,
	stations
}: {
	unit: string;
	data: ParsedValueType[];
	stations: StationsGeoJSONType['features'];
}) {
	if (!data) return [];
	const isOrdinal = unit.trim().endsWith('_category');
	const dateToObjects = data.reduce((acc, item) => {
		const date = parseISO(item?.measured_at || '');
		if (!item?.measured_at || !isValid(date)) return acc;

		const key = format(date, 'yyyy-MM-dd-HH');
		const existingItem = acc.get(key) || ({ date } as CombinedLayerChartDataItem);
		const parsedVal =
			typeof item.value !== 'number' && !item.value
				? null
				: isOrdinal
					? getHeatStressValueByCategory(item.value)
					: item.value;
		const stationName =
			stations.find((f) => f.properties.id === item.id)?.properties.longName.trim() || item.id;
		acc.set(key, { ...existingItem, [stationName]: parsedVal } as CombinedLayerChartDataItem);
		return acc;
	}, new Map<string, CombinedLayerChartDataItem>());

	return [...dateToObjects.values()].sort((a, b) => compareAsc(a.date, b.date));
}
