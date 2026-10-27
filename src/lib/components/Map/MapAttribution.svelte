<script lang="ts">
	import { cn } from '#lib/utils.js';

	const attributions = [
		{
			name: 'DWD',
			url: 'https://www.dwd.de/'
		},
		{
			name: 'Maplibre',
			url: 'https://maplibre.org/maplibre-gl-js/docs/'
		},
		{
			name: 'OpenStreetMap',
			url: 'https://www.openstreetmap.org/'
		}
	];
</script>

<div
	class={cn(
		'fixed right-1 bottom-1 z-10 bg-background/80 text-muted-foreground backdrop-blur-[2px]',
		'rounded-sm border border-border px-1 py-0.5 text-xs'
	)}
>
	©️ Daten:{' '}
	{#each attributions as attribution, i (attribution.name)}
		<a
			href={attribution.url}
			target="_blank"
			rel="noreferrer noopener"
			class={cn(
				'focusable underline decoration-muted-foreground/50 hover:decoration-primary',
				'underline-offset-2 focus-visible:rounded-sm',
				'text-muted-foreground transition-colors hover:text-foreground'
			)}
		>
			{attribution.name}
		</a>
		{#if i < attributions.length - 1},{' '}{/if}
	{/each}
</div>
