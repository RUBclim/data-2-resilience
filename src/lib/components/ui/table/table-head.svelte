<script lang="ts">
	import { cn } from '#lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		className = '',
		children,
		colspan,
		...restProps
	}: HTMLAttributes<HTMLTableCellElement> & {
		className?: string;
		colspan?: number;
		children?: Snippet;
	} = $props();
</script>

<th
	class={cn(
		'h-12 px-4 text-left align-middle font-medium text-muted-foreground has-[[role=checkbox]]:pr-0',
		className
	)}
	{colspan}
	{...restProps}
>
	{@render children?.()}
</th>
