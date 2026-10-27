<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { type Props, buttonVariants } from './index.js';

	let {
		class: className = undefined,
		variant = 'default',
		size = 'default',
		href = undefined,
		type = 'button',
		ref = $bindable(null),
		children,
		...rest
	}: Props = $props();
</script>

<!-- the trigger props of bits-ui (`child` snippet) are spread onto this element through `rest` -->
<svelte:element
	this={href ? 'a' : 'button'}
	bind:this={ref}
	class={cn(buttonVariants({ variant, size }), className)}
	type={href ? undefined : type}
	{href}
	tabindex={0}
	{...rest}
>
	{@render children?.()}
</svelte:element>
