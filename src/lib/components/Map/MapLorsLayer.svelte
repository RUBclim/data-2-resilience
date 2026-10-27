<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import { lors } from '#lib/stores/mapData.js';
	import { addPopup } from '#lib/stores/mapPopupsStore.svelte.js';
	import { mode } from 'mode-watcher';
	import { FillLayer, GeoJSON, LineLayer, Popup } from 'svelte-maplibre';

	interface Props {
		visible?: boolean;
		displayMode?: 'fill' | 'stroke';
	}

	const { visible = false, displayMode = 'fill' }: Props = $props();
</script>

<GeoJSON id="lors" data={lors} promoteId="LORS">
	<FillLayer
		layout={{
			visibility: visible ? 'visible' : 'none'
		}}
		paint={{
			'fill-color': 'transparent'
		}}
	>
		<Popup closeOnClickOutside openOn="click" closeOnClickInside closeOnMove onopen={addPopup}>
			{#snippet children({ data })}
				{#if data}
					<strong class="text-sm font-semibold">
						{data.properties?.name}
					</strong>
					<p>
						{$LL.map.layersTooltips.type.statistischer_bezirk()}
					</p>
					{#if data.properties?.vulnerable === 1}
						<span
							class="mt-1 block border-t border-border pt-1 underline decoration-primary underline-offset-2"
						>
							{$LL.map.layersTooltips.vulnerableArea()}
						</span>
					{/if}
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
			'line-color': mode.current === 'dark' || displayMode === 'stroke' ? 'black' : 'white',
			'line-opacity': 1,
			'line-width': displayMode === 'fill' ? 1.5 : 5
		}}
	/>
	<LineLayer
		layout={{
			'line-cap': 'round',
			'line-join': 'round',
			visibility: visible ? 'visible' : 'none'
		}}
		paint={{
			'line-color':
				displayMode === 'stroke' ? 'white' : mode.current === 'dark' ? 'white' : 'black',
			'line-opacity': 1,
			'line-width': 1
		}}
	/>
</GeoJSON>
