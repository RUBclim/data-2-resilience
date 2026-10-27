<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	// `value` may be bound to `undefined` (as with cmdk-sv): bits-ui has a fallback for it, which
	// svelte doesn't allow for bindings, so it gets the empty string instead
	let {
		value = $bindable(),
		class: className = undefined,
		children,
		...rest
	}: Omit<CommandPrimitive.RootProps, 'value'> & { value?: string } = $props();
</script>

<CommandPrimitive.Root
	class={cn(
		'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
		className
	)}
	bind:value={() => value ?? '', (newValue) => (value = newValue)}
	{...rest}
>
	{@render children?.()}
</CommandPrimitive.Root>
