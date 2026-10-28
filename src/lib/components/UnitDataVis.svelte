<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import type { StationsGeoJSONType } from '#lib/stores/mapData.js';
	import { useStations } from '#lib/stores/stationsStore.js';
	import { datavisType } from '#lib/stores/uiStore.js';
	import DailySationsValuesBarChart from './DailySationsValuesBarChart.svelte';
	import DateRangeSlider from './DateRangeSlider.svelte';
	import Histogram from './Histogram/Histogram.svelte';
	import StationsValuesLineChart from './StationsLineChart/StationsLineChart.svelte';

	interface Props {
		stations: StationsGeoJSONType;
		initialStationIds?: string[];
	}

	let { stations, initialStationIds = [] }: Props = $props();

	// svelte-ignore state_referenced_locally
	const selectedStations = useStations({ initialStationIds, stations });
</script>

<div class="mt-4 flex scroll-mt-20 flex-col rounded-md border border-border">
	<div class="flex scroll-mt-20 flex-col gap-4 border-b border-border p-4" id="stations-datavis">
		{#if $selectedStations.length > 0}
			{#if $datavisType === 'range'}
				<StationsValuesLineChart {stations} />
			{:else}
				<DailySationsValuesBarChart {stations} />
			{/if}
		{:else}
			<p class="flex min-h-16 items-center justify-center p-4 text-center text-muted-foreground">
				{$LL.pages.measurements.noStationsSelected()}
			</p>
		{/if}
	</div>
	<div class="scroll-mt-20 border-border p-4" id="date-range-slider">
		<DateRangeSlider />
	</div>
</div>

{#if $datavisType !== 'range'}
	<div
		class="mt-4 flex scroll-mt-20 flex-col rounded-md border border-border"
		id="stations-histogram"
	>
		<div class="flex flex-col gap-4 p-4">
			<Histogram {stations} {initialStationIds} />
		</div>
	</div>
{/if}
