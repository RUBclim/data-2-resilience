import { fetchStations } from '$lib/stores/mapData';
import { api } from '$lib/utils/api';
import type { StationMetadata } from '$lib/utils/schemas';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { locale }, url }) => {
	let stationsGeoJson = {
		type: 'FeatureCollection',
		features: [] as GeoJSON.Feature[]
	} satisfies GeoJSON.GeoJSON;
	let stationsMetadata: StationMetadata[] = [];
	try {
		const data = await Promise.all([fetchStations(), api().getStationsMetadata()]);
		stationsGeoJson = data[0];
		stationsMetadata = data[1];
	} catch (e) {
		console.error(e);
	}
	const initialStationIds =
		url.searchParams.get('selectedStations')?.split(',').filter(Boolean) || [];
	// pass locale information from "server-context" to "shared server + client context"
	return { locale, stationsGeoJson, stationsMetadata, initialStationIds };
};
