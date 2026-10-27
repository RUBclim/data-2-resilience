import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

const API = 'https://api.data2resilience.de';

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});

/** a fetch stub answering every request with `response` and recording the urls */
function stubFetch(response: () => Response) {
	const urls: string[] = [];
	const fetch = vi.fn(async (url: RequestInfo | URL) => {
		urls.push(String(url));
		return response();
	});
	return { fetch: fetch as unknown as typeof globalThis.fetch, urls };
}

const rawStation = {
	station_id: 'DOBHBF',
	long_name: 'Hauptbahnhof',
	latitude: 51.5,
	longitude: 7.4,
	altitude: 90,
	district: 'Mitte',
	lcz: null,
	station_type: 'biomet'
};

const heatStressMetadata = {
	bounds: [0, 0, 1, 1],
	convex_hull: { coordinates: [[[0, 0]]], type: 'Polygon' },
	keys: { doy: '292', hour: '12', param: 'UTCI', year: '2026' },
	mean: 15,
	metadata: null,
	percentiles: [1, 2],
	range: [5, 25],
	stdev: 1,
	valid_percentage: 99
};

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(new Date('2026-10-19T14:30:00+02:00'));
});
afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('getStationsMetadata', () => {
	it('parses the station metadata', async () => {
		const { fetch, urls } = stubFetch(() => json({ data: [rawStation] }));
		const stations = await api(fetch).getStationsMetadata();
		expect(urls).toEqual([`${API}/v1/stations/metadata`]);
		expect(stations).toEqual([
			expect.objectContaining({ id: 'DOBHBF', longName: 'Hauptbahnhof', stationType: 'biomet' })
		]);
	});

	it('reports schema violations readable', async () => {
		const { fetch } = stubFetch(() => json({ data: [{ ...rawStation, latitude: 'north' }] }));
		await expect(api(fetch).getStationsMetadata()).rejects.toThrow(
			/Validation error: Invalid input: expected number, received string at "data\[0\]\.latitude"/
		);
	});

	it('reports invalid json as a plain error', async () => {
		const { fetch } = stubFetch(() => new Response('{"data": ['));
		const error = await api(fetch)
			.getStationsMetadata()
			.catch((e: unknown) => e);
		expect(error).toBeInstanceOf(Error);
		expect(error).not.toBeInstanceOf(SyntaxError);
		expect((error as Error).message).toMatch(/JSON/);
	});

	it('uses the global fetch by default', async () => {
		const { fetch } = stubFetch(() => json({ data: [] }));
		vi.stubGlobal('fetch', fetch);
		await expect(api().getStationsMetadata()).resolves.toEqual([]);
	});
});

describe('getStationsLatestData', () => {
	it('fetches the latest values of a parameter', async () => {
		const { fetch, urls } = stubFetch(() =>
			json({ data: [{ station_id: 'DOBHBF', utci: 21.5, measured_at: '2026-10-19T12:00:00Z' }] })
		);
		const data = await api(fetch).getStationsLatestData('utci');
		expect(urls).toEqual([`${API}/stations/latest_data?param=utci`]);
		expect(data).toEqual([{ id: 'DOBHBF', utci: 21.5, measured_at: '2026-10-19T12:00:00Z' }]);
	});
});

describe('getStationData', () => {
	const params = {
		id: 'DOBHBF',
		start_date: new Date('2026-10-10T08:15:00Z'),
		end_date: new Date('2026-10-19T12:45:00Z'),
		param: 'utci' as const
	};

	it.each([
		['hourly', '2026-10-10T08:00:00.000Z', '2026-10-19T12:00:00.000Z'],
		['daily', '2026-10-09T22:00:00.000Z', '2026-10-18T22:00:00.000Z'],
		['max', '2026-10-10T08:15:00.000Z', '2026-10-19T12:45:00.000Z'],
		[undefined, '2026-10-10T08:15:00.000Z', '2026-10-19T12:45:00.000Z']
	] as const)('normalizes the dates for the %s scale', async (scale, start, end) => {
		const { fetch, urls } = stubFetch(() => json({ data: [] }));
		await api(fetch).getStationData({ ...params, scale });
		const url = new URL(urls[0]);
		expect(url.pathname).toBe('/v1/data/DOBHBF');
		expect(url.searchParams.get('start_date')).toBe(start);
		expect(url.searchParams.get('end_date')).toBe(end);
		expect(url.searchParams.get('param')).toBe('utci');
	});

	it('returns the measurements', async () => {
		const { fetch } = stubFetch(() => json({ data: [{ station_id: 'DOBHBF', utci: 3 }] }));
		await expect(api(fetch).getStationData({ ...params, scale: 'hourly' })).resolves.toEqual([
			{ id: 'DOBHBF', utci: 3 }
		]);
	});

	it('returns null for parameters the station does not support (422)', async () => {
		const { fetch } = stubFetch(() => json({ detail: 'unsupported' }, 422));
		await expect(api(fetch).getStationData(params)).resolves.toBeNull();
	});
});

describe('getStationsSnapshot', () => {
	it('requests hourly snapshots at the start of the hour', async () => {
		const { fetch, urls } = stubFetch(() =>
			json({
				data: [{ station_id: 'DOBHBF', utci: 21 }],
				visualization: { utci: { cmin: 1, cmax: 30, vmin: 2, vmax: 28 } }
			})
		);
		const result = await api(fetch).getStationsSnapshot({
			date: new Date('2026-10-19T12:45:00Z'),
			param: 'utci',
			scale: 'hourly'
		});
		const url = new URL(urls[0]);
		expect(url.searchParams.get('date')).toBe('2026-10-19T12:00:00.000Z');
		expect(url.searchParams.get('scale')).toBe('hourly');
		expect(url.searchParams.get('suggest_viz')).toBe('true');
		expect(result).toEqual({
			data: [{ id: 'DOBHBF', utci: 21 }],
			visualization: { cmin: 1, cmax: 30, vmin: 2, vmax: 28 }
		});
	});

	it('requests daily snapshots by calendar day', async () => {
		const { fetch, urls } = stubFetch(() => json({ data: [], visualization: null }));
		const result = await api(fetch).getStationsSnapshot({
			date: new Date('2026-10-19T12:45:00+02:00'),
			param: 'utci_max',
			scale: 'daily'
		});
		expect(new URL(urls[0]).searchParams.get('date')).toBe('2026-10-19');
		expect(result).toEqual({ data: [], visualization: null });
	});

	it('defaults missing visualization hints of the parameter', async () => {
		const { fetch } = stubFetch(() => json({ data: [], visualization: { utci: null } }));
		const result = await api(fetch).getStationsSnapshot({
			date: new Date(),
			param: 'utci'
		});
		expect(result?.visualization).toBeNull();
	});

	it('returns null for unsupported parameters (422)', async () => {
		const { fetch } = stubFetch(() => json({}, 422));
		await expect(
			api(fetch).getStationsSnapshot({ date: new Date(), param: 'utci', scale: 'hourly' })
		).resolves.toBeNull();
	});
});

describe('downloadStationData', () => {
	it('returns the csv', async () => {
		const { fetch, urls } = stubFetch(() => new Response('a,b\n1,2'));
		await expect(api(fetch).downloadStationData({ id: 'DOBHBF' })).resolves.toBe('a,b\n1,2');
		expect(urls).toEqual([`${API}/v1/download/DOBHBF`]);
	});

	it('returns null for unknown stations (422)', async () => {
		const { fetch } = stubFetch(() => new Response('', { status: 422 }));
		await expect(api(fetch).downloadStationData({ id: 'NOPE' })).resolves.toBeNull();
	});
});

describe('getHeatStressMetadata', () => {
	it.each([
		['utci', 'UTCI'],
		['pet', 'PET'],
		['at', 'AT'],
		['rh', 'RH'],
		['air_temperature', 'TA'],
		['relative_humidity', 'RH'],
		[' UTCI ', 'UTCI'],
		['unknown', 'UTCI']
	])('maps the unit %s to the raster parameter %s', async (unit, param) => {
		const { fetch, urls } = stubFetch(() => json(heatStressMetadata));
		// 14:30 local time is 12 UTC on day 292
		await api(fetch).getHeatStressMetadata({ date: new Date('2026-10-19T14:30:00+02:00'), unit });
		expect(urls).toEqual([`${API}/tms/metadata/${param}/2026/292/12`]);
	});

	it('returns the parsed metadata', async () => {
		const { fetch } = stubFetch(() => json(heatStressMetadata));
		const metadata = await api(fetch).getHeatStressMetadata({ date: new Date(), unit: 'utci' });
		expect(metadata).toMatchObject({ range: [5, 25], keys: { doy: 292, param: 'utci' } });
	});

	it('returns null when there is no raster (422)', async () => {
		const { fetch } = stubFetch(() => json({}, 422));
		await expect(
			api(fetch).getHeatStressMetadata({ date: new Date(), unit: 'utci' })
		).resolves.toBeNull();
	});
});

describe('getHeatStressColormap', () => {
	it('fetches the colormap for a value range', async () => {
		const { fetch, urls } = stubFetch(() =>
			json({ colormap: [{ rgba: [1, 2, 3, 255], value: 5 }] })
		);
		const colormap = await api(fetch).getHeatStressColormap({
			rangeStart: 5,
			rangeEnd: 25,
			cmap: 'turbo'
		});
		expect(urls).toEqual([`${API}/tms/colormap?stretch_range=%5B5,25%5D&colormap=turbo`]);
		expect(colormap).toEqual([{ rgba: [1, 2, 3, 255], value: 5 }]);
	});

	it('returns null for unknown colormaps (422)', async () => {
		const { fetch } = stubFetch(() => json({}, 422));
		await expect(
			api(fetch).getHeatStressColormap({ rangeStart: 0, rangeEnd: 1, cmap: 'nope' })
		).resolves.toBeNull();
	});
});

describe('getLatestRasterData', () => {
	// NOTE: unlike the other endpoints it ignores the custom fetch and always uses the global one
	it.each([
		['utci', 'UTCI'],
		['utci_category', 'UTCI_CLASS'],
		['pet_category', 'PET_CLASS'],
		['relative_humidity', 'RH'],
		['air_temperature', 'TA']
	])('maps %s to the raster parameter %s', async (param, rasterParam) => {
		const { fetch, urls } = stubFetch(() =>
			json({ datasets: [{ doy: '292', hour: '12', param: rasterParam, year: '2026' }] })
		);
		vi.stubGlobal('fetch', fetch);
		await expect(api().getLatestRasterData({ year: 2026, param })).resolves.toEqual({
			doy: 292,
			hour: 12,
			param: rasterParam,
			year: 2026
		});
		expect(urls).toEqual([
			`${API}/tms/datasets?param=${rasterParam}&order_by=[year,doy,hour]&ascending=false&limit=1`
		]);
	});

	it('fails without datasets', async () => {
		vi.stubGlobal('fetch', stubFetch(() => json({ datasets: [] })).fetch);
		await expect(api().getLatestRasterData({ year: 2026, param: 'utci' })).rejects.toThrow(
			'No datasets found for UTCI'
		);
	});

	it('fails on server errors', async () => {
		vi.stubGlobal(
			'fetch',
			stubFetch(() => new Response('', { status: 500, statusText: 'Internal Server Error' })).fetch
		);
		await expect(api().getLatestRasterData({ year: 2026, param: 'utci' })).rejects.toThrow(
			/Failed to fetch .*: Internal Server Error/
		);
	});
});
