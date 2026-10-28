<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let { class: className = undefined, children, ...rest }: CommandPrimitive.ItemProps = $props();
</script>

<CommandPrimitive.Item
	class={cn(
		'relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
		className
	)}
	{...rest}
>
	{@render children?.()}
</CommandPrimitive.Item>
