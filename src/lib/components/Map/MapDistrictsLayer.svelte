<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import { districts } from '#lib/stores/mapData.js';
	import { mode } from 'mode-watcher';
	import { FillLayer, GeoJSON, LineLayer, Popup } from 'svelte-maplibre';
	import { addPopup } from '#lib/stores/mapPopupsStore.svelte.js';

	interface Props {
		visible?: boolean;
		displayMode?: 'fill' | 'stroke';
	}

	const { visible = true, displayMode = 'fill' }: Props = $props();
</script>

<GeoJSON id="districts" data={districts} promoteId="DISTRICTS">
	<FillLayer
		layout={{
			visibility: visible ? 'visible' : 'none'
		}}
		paint={{ 'fill-color': 'transparent' }}
		hoverCursor="pointer"
		manageHoverState
	>
		<Popup closeOnClickOutside openOn="click" closeOnMove closeOnClickInside onopen={addPopup}>
			{#snippet children({ data })}
				{#if data}
					<strong class="text-sm font-semibold">
						{data.properties?.name}
					</strong>
					<p>
						{$LL.map.layersTooltips.type.stadtbezirk()}
					</p>
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
			'line-color': mode.current === 'dark' ? 'black' : 'white',
			'line-opacity': 1,
			'line-width': displayMode === 'fill' ? 1 : 6
		}}
	/>
	<LineLayer
		layout={{
			'line-cap': 'round',
			'line-join': 'round',
			visibility: visible ? 'visible' : 'none'
		}}
		paint={{
			'line-color': mode.current === 'dark' ? 'white' : 'black',
			'line-opacity': 1,
			'line-width': displayMode === 'fill' ? 1 : 2
		}}
	/>
</GeoJSON>

<style>
	/* MAPLIBRE POPUPS */
	:global(.maplibregl-popup-anchor-top .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-top-left .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-top-right .maplibregl-popup-tip) {
		border-bottom-color: transparent;
	}
	:global(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip) {
		border-top-color: transparent;
	}
	:global(.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
		border-right-color: transparent;
	}
	:global(.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
		border-left-color: transparent;
	}
	:global(.maplibregl-popup-content) {
		background-color: hsl(var(--background) / 0.8);
		backdrop-filter: blur(2px);
		border: 1px solid hsl(var(--border));
		font-size: 0.75rem;
		line-height: 1rem;
		padding: 0.75rem 1rem;
		max-width: 14rem;
		border-radius: 0.25rem;
	}
	:global(.maplibregl-canvas-container:has(.maplibregl-marker:hover) ~ .maplibregl-popup) {
		opacity: 0;
		pointer-events: none;
	}
</style>
