<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import type { StationsGeoJSONType } from '$lib/stores/mapData';
	import CollapsibleParagraph from 'components/CollapsibleParagraph.svelte';
	import StationsSelect from 'components/StationsSelect.svelte';
	import UnitDataVis from 'components/UnitDataVis.svelte';
	import UnitSelect from 'components/UnitSelect.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let stationsGeoJson = $derived(data.stationsGeoJson);
</script>

<h1 class="mb-2 text-xl font-semibold">{$LL.pages.measurements.title()}</h1>
<CollapsibleParagraph>
	{#each Object.values($LL.pages.measurements.intro) as paragraph}
		<p>{paragraph()}</p>
	{/each}
</CollapsibleParagraph>

<div class="scroll-mt-20" id="value-selectors">
	<StationsSelect
		stations={stationsGeoJson as StationsGeoJSONType}
		initialStationIds={data.initialStationIds}
	/>
	<UnitSelect />
</div>

<UnitDataVis
	stations={stationsGeoJson as StationsGeoJSONType}
	initialStationIds={data.initialStationIds}
/>
