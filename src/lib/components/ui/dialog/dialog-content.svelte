<script lang="ts">
	import { Dialog as DialogPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import * as Dialog from './index.js';
	import { cn, flyAndScale } from '#lib/utils.js';

	type Props = WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		children?: Snippet;
	};

	let { class: className = undefined, children, ...rest }: Props = $props();
</script>

<Dialog.Portal>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		forceMount
		class={cn(
			'fixed top-[50%] left-[50%] z-50 grid w-full bg-background',
			'max-w-lg translate-x-[-50%] translate-y-[-50%]',
			'gap-4 border p-6 shadow-lg sm:rounded-lg md:w-full',
			className
		)}
		{...rest}
	>
		{#snippet child({ props, open })}
			{#if open}
				<div {...props} transition:flyAndScale={{ duration: 200 }}>
					{@render children?.()}
				</div>
			{/if}
		{/snippet}
	</DialogPrimitive.Content>
</Dialog.Portal>
