<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import { cn, flyAndScale } from '#lib/utils.js';
	import type { Snippet } from 'svelte';
	import { isNestedInPortal } from '../portal.js';

	type Props = WithoutChildrenOrChild<DropdownMenuPrimitive.ContentProps> & {
		children?: Snippet;
	};

	// collisionPadding and strategy: the defaults of bits-ui 0.x, which positioned the content so far
	let {
		ref = $bindable(null),
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
<DropdownMenuPrimitive.Portal disabled={nested}>
	<DropdownMenuPrimitive.Content
		bind:ref
		forceMount
		{sideOffset}
		{collisionPadding}
		{strategy}
		class={cn(
			'z-50 min-w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-hidden',
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
	</DropdownMenuPrimitive.Content>
</DropdownMenuPrimitive.Portal>
