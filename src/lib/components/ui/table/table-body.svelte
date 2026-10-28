<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		className = '',
		children,
		...restProps
	}: HTMLAttributes<HTMLTableSectionElement> & {
		className?: string;
		children?: Snippet;
	} = $props();
</script>

<tbody class={cn('[&_tr:last-child]:border-0', className)} {...restProps}>
	{@render children?.()}
</tbody>
