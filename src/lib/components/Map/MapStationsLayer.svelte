<script lang="ts">
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import type { StationsGeoJSONType } from '#lib/stores/mapData.js';
	import { toggleStationSelection, useStations } from '#lib/stores/stationsStore.js';
	import { unit, unitLabel, unitOnly, unitWithMinMaxAvg } from '#lib/stores/uiStore.js';
	import { getColorScaleValue } from '#lib/utils/colorScaleUtil.js';
	import { useStationsSnapshotConfig } from '#lib/utils/useStationsSnapshot.js';
	import { createQuery } from '@tanstack/svelte-query';
	import HealthRiskPill from '#lib/components/HealthRiskPill.svelte';
	import { mode } from 'mode-watcher';
	import { GeoJSON, CircleLayer, Popup } from 'svelte-maplibre';
	import { TinyColor } from '@ctrl/tinycolor';
	import type { Map as MapLibreMap } from 'maplibre-gl';

	interface Props {
		stations: StationsGeoJSONType;
		initialStationIds?: string[];
		map: MapLibreMap;
	}

	let { stations, initialStationIds = [] }: Props = $props();

	// svelte-ignore state_referenced_locally
	const selectedStations = useStations({ initialStationIds, stations });
	const stationsSnapshotQueryConfig = $derived.by(() =>
		useStationsSnapshotConfig({ initialStationIds, stations })
	);
	const snapshotQuery = createQuery(() => $stationsSnapshotQueryConfig);
	const apiResponseData = $derived(snapshotQuery.data?.items || []);

	const idToItemMap = $derived.by(() => {
		return apiResponseData.reduce(
			(acc, item) => ({ ...acc, ...(item.id ? { [item.id]: item } : {}) }),
			{} as Record<string, (typeof apiResponseData)[0]>
		);
	});

	let getValueById = $derived((id?: string) => {
		if (!id || !$unitWithMinMaxAvg) return;
		const item = idToItemMap[id];
		if (!item) return;
		const value = item[$unitWithMinMaxAvg as keyof typeof item];
		return value as ({ valueOf(): number } & string) | undefined | null;
	});

	const COLORS = $derived({
		MUTED_FG: mode.current === 'dark' ? '#677489' : '#97a3b6',
		BG: mode.current === 'dark' ? '#1e293b' : '#ffffff',
		FG: mode.current === 'dark' ? '#ffffff' : '#1e293b'
	});

	const stationsWithColors = $derived({
		...stations,
		features: stations.features.map((station) => {
			const value = getValueById(station.properties.id);
			let color = getColorScaleValue({
				unit: $unit,
				LL: $LL,
				value: getValueById(station.properties?.id) as number | string,
				min: snapshotQuery.data?.scaleMin ?? null,
				max: snapshotQuery.data?.scaleMax ?? null
			});
			let borderColor = 'black';
			let bgOpacity = 1;
			let borderWidth = 1;
			let borderOpacity = 1;
			let radius = 5;

			const isUnavailable = value === null;
			const isUnsupported = typeof value === 'undefined';

			const tinyMuted = new TinyColor(COLORS.MUTED_FG);
			if (value && color === 'hsl(var(--muted-foreground))') {
				color =
					mode.current === 'dark'
						? tinyMuted.lighten(15).toString()
						: tinyMuted.darken(15).toString();
				borderColor =
					mode.current === 'dark'
						? tinyMuted.lighten(25).toString()
						: tinyMuted.darken(25).toString();
				bgOpacity = 1;
			} else if (isUnsupported) {
				color = COLORS.MUTED_FG;
				borderColor =
					mode.current === 'dark'
						? tinyMuted.lighten(15).toString()
						: tinyMuted.darken(15).toString();
				bgOpacity = 0.5;
			} else if (isUnavailable) {
				color = COLORS.MUTED_FG;
				borderColor = COLORS.MUTED_FG;
				borderOpacity = 1;
				borderWidth = 3;
				bgOpacity = 0.1;
				radius = 3;
			} else {
				borderColor = new TinyColor(color).darken(30).toString();
			}

			return {
				...station,
				properties: {
					...station.properties,
					color,
					borderColor,
					bgOpacity,
					borderWidth,
					borderOpacity,
					radius
				}
			};
		})
	});

	const selectedStationsGeoJSON = $derived({
		...stations,
		features: stations.features.filter(({ id }) => $selectedStations.includes(`${id}`))
	});
</script>

<GeoJSON id="stations-outer-rings" data={stations} promoteId="id">
	<CircleLayer
		paint={{
			'circle-color': COLORS.BG,
			'circle-radius': 8
		}}
	/>
</GeoJSON>

<GeoJSON id="stations" data={stationsWithColors} promoteId="id">
	<CircleLayer
		interactive
		hoverCursor="pointer"
		paint={{
			'circle-color': ['get', 'color'],
			'circle-opacity': ['get', 'bgOpacity'],
			'circle-radius': ['get', 'radius'],
			'circle-stroke-color': ['get', 'borderColor'],
			'circle-stroke-width': ['get', 'borderWidth'],
			'circle-stroke-opacity': ['get', 'borderOpacity']
		}}
		onclick={(data) => {
			const featId = data.features[0]?.properties?.id;
			if (!featId) return;
			toggleStationSelection(`${featId}`);
		}}
	>
		<Popup openOn="hover" closeOnClickInside>
			{#snippet children(input)}
				{@const data = input.data}
				{@const props = data?.properties || {}}
				{@const value = getValueById(props.id)}
				{@const type = props.stationType === 'temprh' ? 'temprh' : 'biomet'}
				<div class="relative flex flex-col">
					<h3 class="text-sm leading-4 font-bold">{props.longName}</h3>
					<div class="mb-2 border-b border-border pb-1 text-xs text-muted-foreground">
						{$LL.pages.stations.table.cells.stationTypes[type]()}
					</div>
					<div class="text-xs">
						{#if typeof value === 'number'}
							<div class="flex flex-wrap items-center gap-x-1.5">
								<span>
									{(value as { valueOf(): number }).valueOf().toLocaleString($locale, {
										maximumFractionDigits: 1
									})}
									{$unitOnly}
								</span>
								<span class="inline-grid grid-cols-[0.75rem_1fr] items-center gap-1.5 text-nowrap">
									<HealthRiskPill {value} withLabel {stations} {initialStationIds} />
								</span>
							</div>
						{:else if typeof value === 'string'}
							<span class="inline-grid grid-cols-[0.75rem_1fr] items-center gap-1.5 text-nowrap">
								<HealthRiskPill {value} withLabel {stations} {initialStationIds} />
							</span>
						{:else if value === null}
							{@html $LL.pages.measurements.singleStationWithoutAvailableData({
								station: props.longName,
								unit: $unitLabel
							})}
						{:else}
							{@html $LL.pages.measurements.singleUnsupportedStationShort({
								unit: $unitLabel
							})}
						{/if}
					</div>
				</div>
			{/snippet}
		</Popup>
	</CircleLayer>
</GeoJSON>

<!-- after the stations: svelte-maplibre adds the layers in this order, and neighbouring stations
must not cover the ring. Not interactive: the popups of the stations open only on the topmost
interactive layer -->
<GeoJSON id="selected-stations" data={selectedStationsGeoJSON} promoteId="id">
	<CircleLayer
		interactive={false}
		paint={{
			'circle-color': 'transparent',
			'circle-radius': 8,
			'circle-stroke-color': COLORS.FG,
			'circle-stroke-width': 2
		}}
	/>
</GeoJSON>
