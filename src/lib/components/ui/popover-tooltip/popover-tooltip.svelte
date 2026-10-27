<script lang="ts">
	import { Popover } from '#lib/components/ui/popover/index.js';
	import { Tooltip, TooltipProvider } from '#lib/components/ui/tooltip/index.js';
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	type Props = {
		/** delay in ms until the tooltip opens on hover */
		openDelay?: number;
		/** bits-ui 0.x option: tooltips of bits-ui 2 close without delay */
		closeDelay?: 0;
		disableHoverableContent?: boolean;
		children?: Snippet;
	};

	let { openDelay = 0, disableHoverableContent = false, children }: Props = $props();

	const isTouch = new MediaQuery('any-hover: none', false);
</script>

{#if isTouch.current}
	<Popover>
		{@render children?.()}
	</Popover>
{:else}
	<!-- a provider per tooltip: the tooltips of bits-ui 0.x didn't share their delays -->
	<TooltipProvider delayDuration={openDelay} {disableHoverableContent}>
		<Tooltip>
			{@render children?.()}
		</Tooltip>
	</TooltipProvider>
{/if}
