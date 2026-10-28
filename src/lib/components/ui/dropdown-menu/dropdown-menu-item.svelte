<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	type Props = DropdownMenuPrimitive.ItemProps & {
		inset?: boolean;
	};

	let { class: className = undefined, inset = undefined, children, ...rest }: Props = $props();
</script>

<DropdownMenuPrimitive.Item
	class={cn(
		'relative flex cursor-default items-center rounded-sm px-2 py-1.5 outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground',
		inset && 'pl-8',
		className
	)}
	{...rest}
>
	{@render children?.()}
</DropdownMenuPrimitive.Item>
