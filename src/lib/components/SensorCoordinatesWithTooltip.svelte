<script lang="ts">
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import { cn } from '#lib/utils.js';
	import { Check, ChevronDown, Copy, LoaderCircle, MapPin } from '@lucide/svelte';
	import HighlightedSearchQuery from './HighlightedSearchQuery.svelte';
	import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
	import DropdownMenuItem from './ui/dropdown-menu/dropdown-menu-item.svelte';

	interface Props {
		latitude: number;
		longitude: number;
		searchQuery?: string;
	}

	let { latitude, longitude, searchQuery }: Props = $props();

	let copyState: 'idle' | 'copying' | 'copied' = $state('idle');

	const text = $derived(
		`${latitude.toLocaleString($locale)}, ${longitude.toLocaleString($locale)}`
	);
	const googleMapsLink = $derived(`https://www.google.com/maps?q=${latitude},${longitude}`);

	let to: NodeJS.Timeout;
	const copyToClipboard = $derived(async () => {
		clearTimeout(to);
		copyState = 'copying';
		const clipboardText = [latitude, longitude].join(', ');
		await navigator.clipboard.writeText(clipboardText);
		copyState = 'copied';
		to = setTimeout(() => {
			copyState = 'idle';
		}, 2000);
	});
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class={cn(
			'focusable hover:bg-foreground hover:text-background',
			'group flex items-center gap-2 rounded-full p-1 whitespace-nowrap transition',
			text && '-ml-2.5 pr-1.5 pl-2.5'
		)}
	>
		<span>
			<HighlightedSearchQuery {text} {searchQuery} />
		</span>
		<ChevronDown
			class={cn('size-4', text && 'text-muted-foreground group-hover:text-background')}
		/>
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuItem
			closeOnSelect={false}
			class="flex w-full cursor-pointer items-center justify-between gap-6"
		>
			<a href={googleMapsLink} target="_blank" rel="noopener noreferrer" class="contents">
				{$LL.pages.stations.table.cells.coordinates.googleMapsLinkText()}
				<MapPin class="size-5 text-muted-foreground" />
			</a>
		</DropdownMenuItem>
		<DropdownMenuItem
			closeOnSelect={false}
			class={cn(
				'flex w-full cursor-pointer items-center justify-between gap-6',
				copyState === 'copied' &&
					cn(
						'bg-green-100 text-green-800',
						'data-highlighted:bg-green-100 data-highlighted:text-green-800'
					)
			)}
			onclick={copyToClipboard}
		>
			{#if copyState === 'copying'}
				{$LL.pages.stations.table.cells.coordinates.copyCoordinates()}
				<LoaderCircle class="size-5 animate-spin text-muted-foreground" />
			{:else if copyState === 'copied'}
				{$LL.pages.stations.table.cells.coordinates.copiedToClipboard()}
				<Check class="size-5 text-green-500" />
			{:else}
				{$LL.pages.stations.table.cells.coordinates.copyCoordinates()}
				<Copy class="size-5 text-muted-foreground" />
			{/if}
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
