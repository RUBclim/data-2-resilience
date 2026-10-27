<script lang="ts">
	import * as Popover from '#lib/components/ui/popover/index.js';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import { cn } from '#lib/utils.js';
	import type { PopoverContentProps, TooltipContentProps, WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	type Props = WithoutChildrenOrChild<PopoverContentProps & TooltipContentProps> & {
		children?: Snippet;
	};

	let { class: className, children, ...restProps }: Props = $props();

	const isTouch = new MediaQuery('any-hover: none', false);
</script>

{#if isTouch.current}
	<Popover.Content class={cn('w-auto px-3 py-1.5 text-sm', className)} side="top" {...restProps}>
		{@render children?.()}
	</Popover.Content>
{:else}
	<Tooltip.Content class={cn('font-medium', className)} {...restProps}>
		{@render children?.()}
	</Tooltip.Content>
{/if}
