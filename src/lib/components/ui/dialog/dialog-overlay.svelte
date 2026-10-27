<script lang="ts">
	import { Dialog as DialogPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import { cn } from '#lib/utils.js';

	let {
		class: className = undefined,
		...rest
	}: WithoutChildrenOrChild<DialogPrimitive.OverlayProps> = $props();
</script>

<DialogPrimitive.Overlay
	forceMount
	class={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-xs', className)}
	{...rest}
>
	{#snippet child({ props, open })}
		{#if open}
			<div {...props} transition:fade={{ duration: 150 }}></div>
		{/if}
	{/snippet}
</DialogPrimitive.Overlay>
