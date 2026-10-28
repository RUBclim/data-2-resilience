<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import Search from '@lucide/svelte/icons/search';
	import { cn } from '#lib/utils.js';

	let {
		class: className = undefined,
		value = $bindable(''),
		...rest
	}: CommandPrimitive.InputProps = $props();
</script>

<div class="flex items-center border-b px-2">
	<Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
	<CommandPrimitive.Input
		class={cn(
			'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		{...rest}
		bind:value
	/>
</div>
