import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { addHours, format, getDayOfYear, getYear, startOfDay, startOfHour } from 'date-fns';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import {
	HeatStressColormapItemSchema,
	HeatStressMetadataSchema,
	ParsedStationMetadataSchema,
	RasterLayerInfoSchema,
	weatherMeasurementSchemas,
	weatherMeasurementSchemasNoMinMax,
	type RasterLayerInfo,
	type StationMetadata,
	type WeatherMeasurementKey,
	type WeatherMeasurementKeyNoMinMax
} from './schemas';

export const api = (customFetch = fetch) => ({
	getStationsMetadata: async () => {
		const response = await customFetch(`${PUBLIC_API_BASE_URL}/v1/stations/metadata`);
		const data = await parseArrayData(response, ParsedStationMetadataSchema);
		return data satisfies StationMetadata[];
	},
	getStationsLatestData: async (param: WeatherMeasurementKeyNoMinMax) => {
		const response = await customFetch(
			`${PUBLIC_API_BASE_URL}/stations/latest_data?param=${param}`
		);
		const schema = weatherMeasurementSchemasNoMinMax[param];
		const data = await parseArrayData(response, schema);
		return data;
	},
	getStationData: async (params: {
		id: string;
		start_date: Date;
		end_date: Date;
		param: WeatherMeasurementKey;
		scale?: 'hourly' | 'daily' | 'max';
		hour?: string;
	}) => {
		const normalizedStartDate = normalizeDateByScale(params.start_date, params.scale);
		const normalizedEndDate = normalizeDateByScale(params.end_date, params.scale);
		const urlParams = new URLSearchParams({
			...params,
			start_date: normalizedStartDate.toISOString(),
			end_date: normalizedEndDate.toISOString()
		});
		const response = await customFetch(`${PUBLIC_API_BASE_URL}/v1/data/${params.id}?${urlParams}`);

		if (!response.ok && response.status === 422) return null;

		const schema = weatherMeasurementSchemas[params.param];
		const data = await parseArrayData(response, schema);
		return data;
	},
	getStationsSnapshot: async (params: {
		date: Date;
		param: WeatherMeasurementKey;
		scale?: 'hourly' | 'daily';
	}) => {
		const normalizedDate = normalizeDateByScale(params.date, params.scale);
		const urlParams = new URLSearchParams({
			...params,
			date:
				params.scale === 'daily'
					? format(normalizedDate, 'yyyy-MM-dd')
					: normalizedDate.toISOString()
		});
		const response = await customFetch(
			`${PUBLIC_API_BASE_URL}/v1/network-snapshot?${urlParams}&suggest_viz=true`
		);

		if (!response.ok && response.status === 422) return null;

		const schema = weatherMeasurementSchemas[params.param];
		const json = await parseResponse(response);
		const data = parseZodSchema(
			json,
			z.object({
				data: z.array(schema),
				visualization: z.object({
					[params.param]: z
						.object({
							cmax: z.number().nullable(),
							cmin: z.number().nullable(),
							vmax: z.number().nullable(),
							vmin: z.number().nullable()
						})
						.nullable()
						.default({
							cmax: null,
							cmin: null,
							vmax: null,
							vmin: null
						})
				}).nullable()
			})
		);
		return {
			data: data.data,
			visualization:
				data.visualization && data.visualization[params.param]
					? data.visualization[params.param]
					: null
		};
	},
	downloadStationData: async (params: { id: string }) => {
		const response = await customFetch(`${PUBLIC_API_BASE_URL}/v1/download/${params.id}`);
		if (!response.ok && response.status === 422) return null;
		const text = await response.text();
		return typeof text === 'string' ? text : null;
	},
	getHeatStressMetadata: async (params: { date: Date; unit: string }) => {
		const unit =
			z
				.enum(['utci', 'pet', 'at', 'air_temperature', 'rh', 'relative_humidity'])
				.transform((v) => {
					const u = v.trim().toLowerCase();
					if (u === 'air_temperature') return 'TA';
					if (u === 'relative_humidity') return 'RH';
					return u.toUpperCase();
				})
				.catch('UTCI')
				.safeParse(params.unit.trim().toLowerCase())?.data || 'UTCI';

		const diffBtwNowAndUTCInHours = params.date.getTimezoneOffset() / 60;
		const sliderDate = addHours(params.date, diffBtwNowAndUTCInHours);
		const year = getYear(sliderDate);
		const dayOfYear = getDayOfYear(sliderDate);
		const hour = sliderDate.getHours();
		const paddedHour = String(hour).padStart(2, '0');
		const paddedDayOfYear = String(dayOfYear).padStart(3, '0');
		const response = await customFetch(
			`${PUBLIC_API_BASE_URL}/tms/metadata/${unit}/${year}/${paddedDayOfYear}/${paddedHour}`
		);
		if (!response.ok && response.status === 422) return null;
		const data = await parseData(response, HeatStressMetadataSchema);
		return data;
	},
	getHeatStressColormap: async (params: { rangeStart: number; rangeEnd: number; cmap: string }) => {
		const response = await customFetch(
			`${PUBLIC_API_BASE_URL}/tms/colormap?stretch_range=%5B${params.rangeStart},${params.rangeEnd}%5D&colormap=${params.cmap}`
		);

		if (!response.ok && response.status === 422) return null;
		return await parseArrayData(response, HeatStressColormapItemSchema, 'colormap');
	},
	getLatestRasterData: async (params: { year: number; param: string }) => {
		let unit = params.param.toUpperCase();
		if (unit.toUpperCase() === 'UTCI_CATEGORY') {
			unit = 'UTCI_CLASS';
		}
		if (unit.toUpperCase() === 'PET_CATEGORY') {
			unit = 'PET_CLASS';
		}
		if (unit.toUpperCase() === 'RELATIVE_HUMIDITY') {
			unit = 'RH';
		}
		if (unit.toUpperCase() === 'AIR_TEMPERATURE') {
			unit = 'TA';
		}
		const url = `${PUBLIC_API_BASE_URL}/tms/datasets?param=${unit}&order_by=[year,doy,hour]&ascending=false&limit=1`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
		}

		const json = await parseData(response, z.object({ datasets: z.array(RasterLayerInfoSchema) }));
		let datasets: RasterLayerInfo[] = json.datasets || [];

		if (datasets.length === 0) {
			throw new Error(`No datasets found for ${unit}`);
		}
		return datasets;
	}
});

async function parseResponse(response: Response): Promise<unknown> {
	try {
		const json = await response.json();
		return json;
	} catch (e) {
		if (e instanceof Error) {
			throw new Error(e.message);
		}
		throw e;
	}
}

function parseZodSchema<S extends z.ZodSchema>(data: unknown, schema: S): z.infer<S> {
	try {
		return schema.parse(data);
	} catch (e) {
		if (e instanceof z.ZodError) {
			throw fromError(e);
		} else if (e instanceof Error) {
			throw new Error(e.message);
		}
		throw e;
	}
}

async function parseData<S extends z.ZodSchema>(
	response: Response,
	schema: S
): Promise<z.infer<S>> {
	const json = await parseResponse(response);
	return await parseZodSchema(json, schema);
}

async function parseArrayData<S extends z.ZodSchema>(
	response: Response,
	schema: S,
	baseKey = 'data'
): Promise<z.infer<S>[]> {
	const adaptedSchema = z.object({ [baseKey]: z.array(schema) });
	const validated = await parseData(response, adaptedSchema);
	return validated[baseKey];
}

function normalizeDateByScale(date: Date, scale: 'hourly' | 'daily' | 'max' | undefined) {
	switch (scale) {
		case 'hourly':
			return startOfHour(date);
		case 'daily':
			return startOfDay(date);
		default:
			return date;
	}
}
