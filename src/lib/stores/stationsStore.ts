import { browser } from '$app/env';
import { writable } from 'svelte/store';
import { ssp } from 'sveltekit-search-params';
import { queryParam } from './queryParam.svelte';
import type { StationsGeoJSONType } from './mapData';

const defaultStations = ['DOBHBF', 'DODFRP', 'DODGWS'];
const urlStations = writable(defaultStations);
const queryParamStations = queryParam('selectedStations', ssp.string(defaultStations.join(',')));
let initialized = false;

export function useStations({
	initialStationIds = [],
	stations
}: {
	initialStationIds?: string[];
	stations: StationsGeoJSONType;
}) {
	const existInFeatures = (id: string | undefined) =>
		id && stations?.features?.some((feature) => feature.id === id);
	if (!browser) return writable(initialStationIds.filter(existInFeatures));
	if (browser) {
		queryParamStations.subscribe((value) => {
			if (!initialized) {
				const parsedIds = parseUrlStations(value).filter(existInFeatures).toSorted();
				urlStations.set(parsedIds);
				initialized = true;
			}
		});
	}
	return urlStations;
}

export function toggleStationSelection(stationId?: string) {
	if (!stationId) return;
	urlStations.update((stations) => {
		const alreadySelected = stations.includes(stationId);
		const newStations = alreadySelected
			? stations.filter((id) => id !== stationId)
			: [...stations, stationId];
		const parsedNewStations = parseStations(newStations);
		queryParamStations.set(parsedNewStations.join(','));
		return parsedNewStations;
	});
}

export function selectStation(stationId?: string) {
	if (!stationId) return;
	urlStations.update((stations) => {
		const newIds = [...stations, stationId];
		const parsedNewStations = parseStations(newIds);
		queryParamStations.set(parsedNewStations.join(','));
		return parsedNewStations;
	});
}

export function selectMultipleStations(stationIds: string[]) {
	if (stationIds.length === 0) return;
	urlStations.update(() => {
		const parsedNewStations = parseStations(stationIds);
		queryParamStations.set(parsedNewStations.join(','));
		return parsedNewStations;
	});
}

export function deselectStation(stationId?: string) {
	if (!stationId) return;
	urlStations.update((stations) => {
		const newIds = stations.filter((id) => id !== stationId);
		const parsedNewStations = parseStations(newIds);
		queryParamStations.set(parsedNewStations.join(','));
		return parsedNewStations;
	});
}

export function deselectAllStations() {
	urlStations.set([]);
	queryParamStations.set('');
}

function parseUrlStations(urlStations: string) {
	return parseStations(urlStations.split(','));
}

function parseStations(stations: string[]) {
	return [
		...new Set(
			stations
				.map((id) => id.trim())
				.filter(Boolean)
				.toSorted()
		)
	];
}
