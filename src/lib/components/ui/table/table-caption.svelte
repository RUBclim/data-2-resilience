<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		className = '',
		children,
		...restProps
	}: HTMLAttributes<HTMLElement> & {
		className?: string;
		children?: Snippet;
	} = $props();
</script>

<caption class={cn('mt-4 text-sm text-muted-foreground', className)} {...restProps}>
	{@render children?.()}
</caption>
