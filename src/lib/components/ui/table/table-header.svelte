<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		children,
		className = '',
		...restProps
	}: HTMLAttributes<HTMLTableSectionElement> & {
		children?: Snippet;
		className?: string;
	} = $props();
</script>

<thead class={cn('[&_tr]:border-b', className)} {...restProps}>
	{@render children?.()}
</thead>
