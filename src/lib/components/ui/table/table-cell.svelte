<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		className = '',
		children,
		...restProps
	}: HTMLAttributes<HTMLTableCellElement> & {
		className?: string;
		children?: Snippet;
	} = $props();
</script>

<td class={cn('p-4 align-middle has-[[role=checkbox]]:pr-0', className)} {...restProps}>
	{@render children?.()}
</td>
