<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { Info, TriangleAlert } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { type Variant, alertVariants } from './index.js';

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		variant?: Variant;
	};

	interface Props {
		class?: $$Props['class'];
		variant?: $$Props['variant'];
		children?: import('svelte').Snippet;
		icon?: Snippet;
		[key: string]: any;
	}

	let {
		class: className = undefined,
		variant = 'default',
		children,
		icon,
		...rest
	}: Props = $props();
</script>

<div class={cn(alertVariants({ variant }), className)} {...rest} role="alert">
	<div>
		{@render children?.()}
	</div>
	{#if icon}
		{@render icon()}
	{:else if ['warning', 'destructive'].includes(variant || 'default')}
		<TriangleAlert class="size-5 shrink-0" />
	{:else}
		<Info class="size-5 shrink-0" />
	{/if}
</div>
