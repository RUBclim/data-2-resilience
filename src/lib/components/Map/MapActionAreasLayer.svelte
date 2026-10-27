<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import { actionareas } from '#lib/stores/mapData.js';
	import { addPopup } from '#lib/stores/mapPopupsStore.svelte.js';
	import { FillLayer, GeoJSON, LineLayer, Popup } from 'svelte-maplibre';

	interface Props {
		visible?: boolean;
		displayMode?: 'fill' | 'stroke';
	}

	const { visible = false, displayMode = 'fill' }: Props = $props();
</script>

<GeoJSON id="action-areas" data={actionareas} promoteId="ACTION_AREAS">
	<LineLayer
		layout={{
			'line-cap': 'round',
			'line-join': 'round',
			visibility: visible && displayMode === 'stroke' ? 'visible' : 'none'
		}}
		paint={{
			'line-color': 'black',
			'line-width': 10
		}}
	/>
	<FillLayer
		layout={{
			visibility: visible ? 'visible' : 'none'
		}}
		paint={{
			'fill-color': displayMode === 'fill' ? '#FACC13' : 'transparent',
			'fill-opacity': 0.3
		}}
	>
		<Popup closeOnClickOutside openOn="click" closeOnClickInside closeOnMove onopen={addPopup}>
			{#snippet children({ data })}
				{#if data}
					<strong class="text-sm font-semibold">
						{data.properties?.name}
					</strong>
					<span
						class="mt-1 block border-t border-border pt-1 underline decoration-primary underline-offset-2"
					>
						{$LL.map.layersTooltips.vulnerableArea()}
					</span>
				{/if}
			{/snippet}
		</Popup>
	</FillLayer>
	<LineLayer
		layout={{
			'line-cap': 'round',
			'line-join': 'round',
			visibility: visible ? 'visible' : 'none'
		}}
		paint={{
			'line-color': displayMode === 'stroke' ? 'white' : '#FACC13',
			'line-width': displayMode === 'stroke' ? 4 : 2.5
		}}
	/>
</GeoJSON>
