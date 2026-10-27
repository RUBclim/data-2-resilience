<script lang="ts">
	import { PopoverTrigger } from '#lib/components/ui/popover/index.js';
	import { TooltipTrigger } from '#lib/components/ui/tooltip/index.js';
	import type { PopoverTriggerProps, TooltipTriggerProps } from 'bits-ui';
	import { MediaQuery } from 'svelte/reactivity';

	let { ...restProps }: PopoverTriggerProps & TooltipTriggerProps = $props();

	const isTouch = new MediaQuery('any-hover: none', false);
</script>

{#if isTouch.current}
	<PopoverTrigger {...restProps} />
{:else}
	<TooltipTrigger {...restProps} />
{/if}
