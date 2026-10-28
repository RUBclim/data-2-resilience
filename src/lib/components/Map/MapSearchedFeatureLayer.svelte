<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import { cn } from '#lib/utils.js';
	import { Search } from '@lucide/svelte';
	import { Marker } from 'svelte-maplibre';

	const {
		coordinates,
		name
	}: {
		coordinates: [number, number];
		name: string;
	} = $props();
</script>

<!-- a plain marker: MarkerLayer queries the rendered features of a source and missed the 'load'
of the map when the source came later, so the marker only showed up after the next map move -->
<Marker lngLat={coordinates} interactive class="group relative hover:z-10">
	<button
		type="button"
		class={cn(
			'relative grid size-10 place-items-center rounded-full border-2 border-background bg-primary outline-hidden',
			'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
		)}
		aria-label={name}
	>
		<span class="absolute inset-0 rounded-full border border-black/20 mix-blend-multiply"></span>
		<Search class="size-5 text-primary-foreground" />
	</button>
	<div
		class={cn(
			'pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 group-hover:-translate-y-2',
			'w-fit max-w-96 rounded-md bg-background px-4 py-3 opacity-0 transition group-hover:opacity-100',
			'w-48 border border-border shadow-lg'
		)}
	>
		<div class="relative flex flex-col gap-1">
			<span class="text-xs leading-4 text-muted-foreground">{$LL.map.search.tooltip()}:</span>
			<strong class="text-sm leading-4 font-semibold">
				{name}
			</strong>
		</div>
	</div>
</Marker>
