<script lang="ts">
	import { page } from '$app/state';
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import Header from '#lib/components/Header.svelte';
	import LeftSidebar from '#lib/components/LeftSidebar.svelte';
	import Map from '#lib/components/Map/Map.svelte';
	import SidebarsLayout from '#lib/components/SidebarsLayout.svelte';
	import StationsTable from '#lib/components/StationsTable.svelte';
	import type { StationsGeoJSONType } from '#lib/stores/mapData.js';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let stationsGeoJson = $derived(data?.stationsGeoJson);
	let stationsMetadata = $derived(data?.stationsMetadata);

	let isStationsPage = $derived(page.url.pathname.replace(`/${$locale}`, '') === '/stations');
	let isAboutPage = $derived(page.url.pathname.replace(`/${$locale}`, '') === '/about');
</script>

<Header title={$LL.siteNameShort()} subtitle={$LL.siteSubtitle()} />
<SidebarsLayout>
	<!-- @migration-task: migrate this slot by hand, `left-sidebar` is an invalid identifier -->
	<LeftSidebar slot="left-sidebar">
		{@render children?.()}
	</LeftSidebar>
	{#if isStationsPage}
		<StationsTable stations={stationsMetadata} />
	{:else}
		<Map stations={stationsGeoJson as StationsGeoJSONType} />
	{/if}
</SidebarsLayout>
{#if isAboutPage}
	{@render children?.()}
{/if}
