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

<tfoot class={cn('bg-muted/50 font-medium text-primary-foreground', className)} {...restProps}>
	{@render children?.()}
</tfoot>
