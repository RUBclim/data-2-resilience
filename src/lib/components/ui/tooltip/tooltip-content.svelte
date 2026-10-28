<script lang="ts">
	import { cn, flyAndScale } from '#lib/utils.js';
	import { Tooltip as TooltipPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { isNestedInPortal } from '../portal.js';

	type Props = WithoutChildrenOrChild<TooltipPrimitive.ContentProps> & {
		children?: Snippet;
	};

	// collisionPadding and strategy: the defaults of bits-ui 0.x, which positioned the content so far
	let {
		class: className = undefined,
		sideOffset = 4,
		collisionPadding = 8,
		strategy = 'absolute',
		children,
		...rest
	}: Props = $props();

	const nested = isNestedInPortal();
</script>

<!-- bits-ui 0.x portalled the content to the body (unless nested) and transitioned it on its own -->
<TooltipPrimitive.Portal disabled={nested}>
	<TooltipPrimitive.Content
		forceMount
		{sideOffset}
		{collisionPadding}
		{strategy}
		class={cn(
			'z-50 overflow-clip rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md',
			className
		)}
		{...rest}
	>
		{#snippet child({ wrapperProps, props, open })}
			{#if open}
				<!-- nested content was the positioned box itself, sized within its container (`max-w-full`) -->
				<div
					{...wrapperProps}
					style:min-width={nested ? '0' : undefined}
					style:max-width={nested ? '100%' : undefined}
				>
					<div {...props} transition:flyAndScale={{ y: 8, duration: 150 }}>
						{@render children?.()}
					</div>
				</div>
			{/if}
		{/snippet}
	</TooltipPrimitive.Content>
</TooltipPrimitive.Portal>
