<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_GEOCODING_URL } from '$env/static/public';
	import { LL } from '$i18n/i18n-svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { reactiveQueryArgs } from '$lib/utils/queryUtils.svelte';
	import { debounceState } from '$lib/utils/runeUtil.svelte';
	import { responseSchema, type AddressFeature } from '$lib/utils/searchUtil';
	import { createQuery, type QueryFunctionContext, type QueryKey } from '@tanstack/svelte-query';
	import SearchInputField from 'components/SearchInputField.svelte';
	import { Command, CommandEmpty, CommandItem } from 'components/ui/command';
	import { onDestroy, onMount } from 'svelte';

	const {
		queryValue,
		onSearchQueryChanged = () => {},
		onFeatureSearched,
		onSearchCleared
	}: {
		queryValue?: string;
		onSearchQueryChanged?: (query: string) => void;
		onFeatureSearched: (feature: AddressFeature) => void;
		onSearchCleared: () => void;
	} = $props();

	let container: HTMLDivElement | null = $state(null);
	let internalSearchQuery = $state('');
	let suggesitonsOpened = $state(false);
	let wasInputed = $state(false);
	let debouncedQuery = $derived.by(debounceState(() => internalSearchQuery, 300)) as string;

	let initialized = false;
	$effect(() => {
		if (typeof queryValue === 'string' && queryValue !== internalSearchQuery && !initialized) {
			internalSearchQuery = queryValue;
			initialized = true;
		}
	});

	function onClickAnywhere(evt: MouseEvent) {
		if (!container || !evt.target) return;
		const targetIsContainer = evt.target === container;
		const targetIsWithinContainer = container.contains(evt.target as Node);
		if (targetIsContainer || targetIsWithinContainer) return;
		suggesitonsOpened = false;
	}
	onMount(() => {
		if (!browser) return;
		document.addEventListener('click', onClickAnywhere);
	});
	onDestroy(() => {
		if (!browser) return;
		document.removeEventListener('click', onClickAnywhere);
	});
	// --------------

	const searchResultsQuery = createQuery(
		reactiveQueryArgs(() => ({
			queryKey: ['addressSearch', debouncedQuery?.trim(), wasInputed],
			queryFn: async ({
				queryKey: [_, searchTerm, wasInputed]
			}: QueryFunctionContext<QueryKey>) => {
				if (!searchTerm || !wasInputed) return [];
				const query = encodeURIComponent(`${searchTerm}`.trim());
				const response = await fetch(`${PUBLIC_GEOCODING_URL}?query=${query}&outputformat=JSON`);

				if (!response.ok) {
					console.error(`Geocoding error: ${response.status} ${response.statusText}`);
					throw new Error(`Geocoding error: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				const parsedData = responseSchema.safeParse(data).data?.features || [];
				if (parsedData.length === 0) return [];
				const validResults = parsedData
					.filter((f) => f.properties.text && f.geometry.coordinates.length === 2)
					.sort((f1, f2) => f2.properties.score - f1.properties.score);
				return validResults;
			}
		}))
	);
	const { isLoading, isError, data = [] } = $derived($searchResultsQuery);
	const isEmpty = $derived(!isLoading && data.length === 0);
	const showPopover = $derived(
		wasInputed &&
			internalSearchQuery?.trim().length > 0 &&
			debouncedQuery?.trim().length > 0 &&
			Boolean(data || isEmpty || isError || isLoading)
	);

	$effect(() => {
		suggesitonsOpened = showPopover;
	});

	// --------------

	let command: string | undefined = $state();

	$effect(() => {
		const firstResult = data[0];
		if (!firstResult) return;
		command = firstResult.id;
	});

	// --------------

	$effect(() => {
		if (internalSearchQuery.length === 0) {
			handleSelect(undefined);
		}
	});

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			const limitedData = data.slice(0, 5);
			const index = limitedData.findIndex((result) => result.id === command);
			const nextIndex = index + 1 > limitedData.length - 1 ? 0 : index + 1;
			command = data[nextIndex]?.id || limitedData[0]?.id;
		} else if (event.key === 'ArrowUp') {
			const limitedData = data.slice(0, 5);
			const index = limitedData.findIndex((result) => result.id === command);
			const nextIndex = index - 1 < 0 ? limitedData.length - 1 : index - 1;
			command = data[nextIndex]?.id || limitedData[limitedData.length - 1]?.id;
		} else if (event.key === 'Escape') {
			command = undefined;
			suggesitonsOpened = false;
		} else if (event.key === 'Enter') {
			const limitedData = data.slice(0, 5);
			const index = limitedData.findIndex((result) => result.id === command);
			if (index === -1 || !limitedData[index]?.properties?.text || !limitedData[index]?.id) return;
			internalSearchQuery = limitedData[index].properties.text;
			onSearchQueryChanged(internalSearchQuery);
			command = limitedData[index].id;
			handleSelect(limitedData[index]);
		}
	}

	// --------------

	function handleSelect(feature: undefined | AddressFeature) {
		if (feature) {
			internalSearchQuery = feature.properties.text || '';
			onSearchQueryChanged(internalSearchQuery);
			onFeatureSearched(feature);
		} else if (internalSearchQuery.length === 0) {
			onSearchCleared();
		}
		suggesitonsOpened = false;
	}
</script>

<div
	id="map-search"
	class={cn('fixed right-20 top-[calc(var(--headerHeight,5rem)+0.75rem)] z-10 w-64 transition')}
	bind:this={container}
>
	<div class="relative">
		<Popover.Root open={suggesitonsOpened}>
			<Popover.Trigger asChild>
				<SearchInputField
					placeholder={$LL.map.search.placeholder()}
					value={internalSearchQuery}
					onchange={(newVal) => {
						internalSearchQuery = newVal;
						onSearchQueryChanged(internalSearchQuery);
						suggesitonsOpened = showPopover;
						wasInputed = true;
					}}
					classNames={{
						input: cn('shadow-lg shadow-black/5 dark:shadow-black/80'),
						container: cn('max-w-64 justify-end')
					}}
					{onKeyDown}
					onFocus={() => (suggesitonsOpened = showPopover)}
				/>
			</Popover.Trigger>
			<Popover.Content
				class="absolute right-0 top-full !block min-w-64 max-w-96 translate-y-1.5 p-0"
				side="bottom"
				align="end"
			>
				<Command bind:value={command}>
					{#if isLoading}
						<CommandEmpty>{$LL.map.search.loading()}</CommandEmpty>
					{:else if isError}
						<CommandEmpty>{$LL.map.search.error()}</CommandEmpty>
					{:else if isEmpty}
						<CommandEmpty>{$LL.map.search.noResults()}</CommandEmpty>
					{/if}
					{#each data.slice(0, 5) as feature}
						<CommandItem
							value={feature.id}
							class={cn(
								'bg-none font-sans text-base',
								'border-t border-border px-4 py-3 text-base leading-5',
								'focusable text-left hover-hover:hover:bg-muted',
								'focus-visible:z-50 focus-visible:border-background'
							)}
							onSelect={() => handleSelect(feature)}
						>
							{feature.properties.text}
						</CommandItem>
					{/each}
				</Command>
			</Popover.Content>
		</Popover.Root>
	</div>
</div>
