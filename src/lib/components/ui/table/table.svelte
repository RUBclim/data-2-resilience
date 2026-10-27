<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		className = '',
		children,
		...restProps
	}: HTMLAttributes<HTMLTableElement> & {
		className?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="relative w-full overflow-auto">
	<table class={cn('w-full caption-bottom text-sm', className)} {...restProps}>
		{@render children?.()}
	</table>
</div>
