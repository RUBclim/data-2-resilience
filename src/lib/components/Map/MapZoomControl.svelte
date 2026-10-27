<script lang="ts">
	import { page } from '$app/state';
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import { isLeftSidebarOpened } from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import { Minus, Plus } from '@lucide/svelte';
	import type { Map as MapLibreMap } from 'maplibre-gl';
	import { Button } from '../ui/button';

	interface Props {
		map: MapLibreMap;
	}

	let { map }: Props = $props();

	// svelte-ignore state_referenced_locally
	let maxZoomReached = $state(map?.getZoom() >= map?.getMaxZoom());
	let zoomInitialized = false;

	function initZoomControl(mp: MapLibreMap) {
		if (zoomInitialized || !mp) return;
		zoomInitialized = true;
		mp.on('zoom', () => {
			const zoom = mp?.getZoom();
			const maxZoom = mp?.getMaxZoom();
			maxZoomReached = zoom >= maxZoom;
		});
	}

	$effect(() => {
		initZoomControl(map);
	});
	const isAboutPage = $derived(page.url.pathname.startsWith(`/${$locale}/about`));
	const showLeftSidebar = $derived(!isAboutPage && $isLeftSidebarOpened);
</script>

<nav
	aria-label={$LL.map.zoom.navAlt()}
	class={cn(
		'fixed top-[calc(var(--headerHeight,5rem)+1rem)] right-4 z-50 flex flex-col gap-px',
		'w-10 rounded-md border border-border bg-border',
		'shadow-lg transition duration-300 ease-in-out dark:shadow-black/80',
		showLeftSidebar && 'max-sm:pointer-events-none max-sm:opacity-0'
	)}
>
	<Button
		size="icon"
		variant="ghost"
		aria-label={$LL.map.zoom.zoomIn()}
		class={cn(
			'relative h-9 w-full rounded-b-none bg-background',
			'focusable focus-visible:z-50 focus-visible:rounded',
			'p-0'
		)}
		disabled={maxZoomReached}
		onclick={() => map.zoomIn()}
	>
		<Plus class="size-5" />
	</Button>
	<Button
		size="icon"
		variant="ghost"
		aria-label={$LL.map.zoom.zoomOut()}
		class={cn(
			'relative h-9 w-full rounded-t-none bg-background',
			'focusable focus-visible:z-50 focus-visible:rounded',
			'p-0'
		)}
		onclick={() => map.zoomOut()}
	>
		<Minus class="size-5" />
	</Button>
</nav>
