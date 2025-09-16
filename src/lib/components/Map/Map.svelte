<script lang="ts">
	import { page } from '$app/state';
	import { page as storePage } from '$app/stores';
	import { locale } from '$i18n/i18n-svelte';
	import type { StationsGeoJSONType } from '$lib/stores/mapData';
	import { closePopup } from '$lib/stores/mapPopupsStore.svelte';
	import {
		boundariesMode,
		isLeftSidebarOpened,
		mapLatitude,
		mapLongitude,
		mapSearch,
		mapSearchCoordinates,
		mapZoom,
		showSatellite,
		showBuildings,
		showStreets,
		updateMapCoordinates,
		updateMapSearch,
		updateMapSearchCoordinates,
		updateMapZoom
	} from '$lib/stores/uiStore';
	import { cn } from '$lib/utils';
	import type { AddressFeature } from '$lib/utils/searchUtil';
	import { shortcut } from '@svelte-put/shortcut';
	import { mode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { MapLibre, ScaleControl, type Map } from 'svelte-maplibre';
	import ChoroplethLegend from '../ChoroplethLegend.svelte';
	import MapActionAreasLayer from './MapActionAreasLayer.svelte';
	import MapAttribution from './MapAttribution.svelte';
	import MapDistrictsLayer from './MapDistrictsLayer.svelte';
	import MapLayerSelection from './MapLayerSelection.svelte';
	import MapLorsLayer from './MapLorsLayer.svelte';
	import MapMeasurementsRasterLayer from './MapMeasurementsRasterLayer.svelte';
	import MapSearchInput from './MapSearchInput.svelte';
	import MapSearchedFeatureLayer from './MapSearchedFeatureLayer.svelte';
	import MapStationsLayer from './MapStationsLayer.svelte';
	import MapZoomControl from './MapZoomControl.svelte';
	import ErrorBoundary from './ErrorBoundary.svelte';
	import {
		positronMapStyleDay,
		positronMapStyleNight,
		positronMapStyleDayWithSatellite,
		positronMapStyleNightWithSatellite
	} from '$lib/stores/mapStyle';

	// Global patch to prevent AbortError from showing in console
	const originalConsoleError = console.error;
	console.error = function (...args) {
		if (
			args.length > 0 &&
			typeof args[0] === 'string' &&
			args[0].includes('AbortError') &&
			(args[0].includes('setSourceProperty') ||
				args[0].includes('setTiles') ||
				args.some((arg) => arg && arg.name === 'AbortError'))
		) {
			return;
		}
		return originalConsoleError.apply(console, args);
	};

	interface Props {
		stations: StationsGeoJSONType;
		initialStationIds?: string[];
	}

	const { stations, initialStationIds = [] }: Props = $props();

	let map: Map | undefined = $state();

	let isAboutPage = $derived(page.url.pathname.startsWith(`/${$locale}/about`));
	let showLeftSidebar = $derived(!isAboutPage && $isLeftSidebarOpened);

	let mapLng = $state($mapLongitude);
	let mapLat = $state($mapLatitude);
	let mapZ = $state($mapZoom);

	// Base style selection (only for theme/satellite changes)
	const baseMapStyle = $derived(
		$showSatellite
			? $mode === 'dark'
				? positronMapStyleNightWithSatellite
				: positronMapStyleDayWithSatellite
			: $mode === 'dark'
				? positronMapStyleNight
				: positronMapStyleDay
	);

	// Effect 1: Handle style changes only (theme/satellite)
	$effect(() => {
		if (!map || !map.isStyleLoaded()) return;
		map.setStyle(baseMapStyle);
	});

	// Effect 2: Handle visibility changes only (buildings/streets)
	$effect(() => {
		if (!map) return;

		$showBuildings;
		$showStreets;

		const applyVisibility = () => {
			// Use requestAnimationFrame to ensure DOM is ready
			requestAnimationFrame(() => {
				try {
					// Buildings
					const buildingVisibility = $showBuildings ? 'visible' : 'none';
					['building', 'building-top'].forEach((layerId) => {
						try {
							if (map.getLayer(layerId)) {
								map.setLayoutProperty(layerId, 'visibility', buildingVisibility);
							}
						} catch (e) {}
					});

					// Streets
					const streetVisibility = $showStreets ? 'visible' : 'none';
					const style = map.getStyle();
					if (style?.layers) {
						style.layers.forEach((layer) => {
							try {
								if (
									(layer.type === 'line' || layer.type === 'symbol') &&
									layer['source-layer'] === 'transportation' &&
									!layer.id.includes('rail')
								) {
									map.setLayoutProperty(layer.id, 'visibility', streetVisibility);
								}

								if (layer.type === 'symbol' && layer['source-layer'] === 'transportation_name') {
									map.setLayoutProperty(layer.id, 'visibility', streetVisibility);
								}
							} catch (e) {}
						});
					}

					// CRITICAL FIX: After style change, ensure heat raster layers are positioned correctly
					// This handles the race condition between style loading and raster layer re-addition
					setTimeout(() => {
						const style = map.getStyle();
						if (style?.layers) {
							const heatRasterLayers = style.layers.filter(layer =>
								layer.id.includes('raster-layer-') && layer.type === 'raster' && !layer.id.includes('satellite')
							);
							// Find the first road/transportation layer to position heat raster layers before streets
							const firstRoadLayer = style.layers.find(layer =>
								layer['source-layer'] === 'transportation' && layer.type === 'line'
							);
							const buildingLayer = style.layers.find(layer => layer.id === 'building');

							if (heatRasterLayers.length > 0 && (firstRoadLayer || buildingLayer)) {
								const targetLayerId = firstRoadLayer?.id || 'building';
								heatRasterLayers.forEach(rasterLayer => {
									try {
										// Move heat raster layers before first road layer (or building if no roads)
										map.moveLayer(rasterLayer.id, targetLayerId);
									} catch (e) {}
								});
							}
						}
					}, 100); // Small delay to ensure all layers are added
				} catch (e) {
					console.debug('Error applying visibility settings:', e);
				}
			});
		};

		// Apply immediately if map is loaded
		if (map.loaded() && map.isStyleLoaded()) {
			applyVisibility();
		}

		// Also apply after style loads
		map.on('style.load', applyVisibility);

		return () => {
			map.off('style.load', applyVisibility);
		};
	});

	onMount(() => {
		mapLng = $mapLongitude;
		mapLat = $mapLatitude;
		mapZ = $mapZoom;
	});

	const showSearchedFeature = (map: maplibregl.Map, feature: AddressFeature | undefined) => {
		if (!feature) return;
		const [lng, lat] = feature.geometry.coordinates;
		updateMapSearchCoordinates([lng, lat]);
	};

	$effect(() => {
		if (!map) return;

		if ($mapSearchCoordinates) {
			const [lng, lat] = $mapSearchCoordinates;
			map.flyTo({ center: [lng, lat], zoom: 10 });
		}
	});

	const currentPage = $derived.by(() => {
		const p = page.url.pathname.replace(`/${$locale}`, '').replaceAll('/', '');
		return p === '' ? 'measurements' : p;
	});
	const displayMode = $derived(currentPage === 'heat-stress' || $showSatellite ? 'stroke' : 'fill');

	$effect(() => {
		if (!map || !currentPage) return;
		map.zoomTo(map.getZoom() || 10);
	});

	function disableMapRotation(map: maplibregl.Map) {
		map.dragRotate.disable();
		map.keyboard.disable();
		map.touchZoomRotate.disableRotation();
	}

	function onMapLoad(map: maplibregl.Map) {
		if (!map) return;
		map.zoomTo(map.getZoom() ?? 10);
		disableMapRotation(map);
	}

	function handleEscape() {
		closePopup();
	}

	boundariesMode.subscribe(() => closePopup());
	storePage.subscribe(() => closePopup());
</script>

<svelte:window
	use:shortcut={{
		trigger: {
			key: 'Escape',
			callback: handleEscape,
			preventDefault: false
		}
	}}
/>

<ErrorBoundary>
	<div
		id="map"
		class={cn(
			'main-map relative grid h-full w-full items-center justify-center overflow-clip',
			showLeftSidebar ? 'left-sidebar-open' : 'left-sidebar-closed'
		)}
	>
		<MapLibre
			bind:map
			center={[mapLng, mapLat]}
			zoom={mapZ}
			dragRotate={false}
			pitchWithRotate={false}
			maxPitch={0}
			maxZoom={15.5}
			maxBounds={[
				[7.090650277147461, 51.400616267063896],
				[7.826598237576263, 51.61374377792475]
			]}
			attributionControl={false}
			class="relative h-[calc(100vh-var(--headerHeight,5rem))] w-screen"
			standardControls={false}
			style={baseMapStyle}
			onmoveend={(e) => {
				if (!e.target) return;
				const center = e.target.getCenter();
				const zoom = e.target.getZoom();
				center && updateMapCoordinates([center.lng, center.lat]);
				zoom && updateMapZoom(zoom);
			}}
			onload={onMapLoad}
		>
			{#snippet children({ map })}
				{#if currentPage === 'measurements'}
					<MapSearchInput
						onFeatureSearched={(f) => showSearchedFeature(map, f)}
						onSearchCleared={() => {
							updateMapSearch('');
							updateMapSearchCoordinates(undefined);
						}}
						queryValue={$mapSearch}
						onSearchQueryChanged={updateMapSearch}
					/>
				{/if}
				<MapZoomControl {map} />
				<MapLayerSelection />
				<MapMeasurementsRasterLayer visible={currentPage === 'heat-stress'} {map} />
				<MapDistrictsLayer visible={$boundariesMode === 'districts'} {displayMode} />
				<MapLorsLayer visible={$boundariesMode === 'lors'} {displayMode} />
				<MapActionAreasLayer visible={$boundariesMode === 'lors'} {displayMode} />
				{#if currentPage === 'measurements'}
					<MapStationsLayer {stations} {map} {initialStationIds} />
				{/if}
				{#if $mapSearchCoordinates && $mapSearch}
					<MapSearchedFeatureLayer
						name={$mapSearch}
						coordinates={[$mapSearchCoordinates[0], $mapSearchCoordinates[1]]}
					/>
				{/if}
				<ScaleControl unit="metric" position="bottom-right" />
			{/snippet}
		</MapLibre>

		<ChoroplethLegend {stations} {initialStationIds} />
		<MapAttribution />
	</div>
</ErrorBoundary>

<style>
	.main-map :global(.maplibregl-canvas) {
		outline: none;
	}

	.main-map:has(:global(.maplibregl-canvas:focus-visible))::after {
		content: '';
		position: absolute;
		inset: -4px;
		z-index: 1000;
		border-radius: 0.75rem;
		box-shadow:
			inset 0 0 0 6px hsl(var(--background)),
			inset 0 0 0 8px hsl(var(--ring));
	}

	.main-map :global(.maplibregl-ctrl-bottom-right .maplibregl-ctrl) {
		margin: 0;
		position: fixed;
		bottom: 2rem;
		right: 0.5rem;
		z-index: 0;
	}
</style>
