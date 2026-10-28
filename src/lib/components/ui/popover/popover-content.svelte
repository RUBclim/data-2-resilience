<script lang="ts">
	import { Popover as PopoverPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import { cn, flyAndScale } from '#lib/utils.js';
	import type { Snippet } from 'svelte';
	import { isNestedInPortal } from '../portal.js';

	type Props = WithoutChildrenOrChild<PopoverPrimitive.ContentProps> & {
		children?: Snippet;
	};

	// collisionPadding and strategy: the defaults of bits-ui 0.x, which positioned the content so far
	let {
		class: className = undefined,
		collisionPadding = 8,
		strategy = 'absolute',
		children,
		...rest
	}: Props = $props();

	const nested = isNestedInPortal();
</script>

<!-- bits-ui 0.x portalled the content to the body (unless nested) and transitioned it on its own -->
<PopoverPrimitive.Portal disabled={nested}>
	<PopoverPrimitive.Content
		forceMount
		{collisionPadding}
		{strategy}
		class={cn(
			'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden',
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
					<div {...props} transition:flyAndScale>
						{@render children?.()}
					</div>
				</div>
			{/if}
		{/snippet}
	</PopoverPrimitive.Content>
</PopoverPrimitive.Portal>
