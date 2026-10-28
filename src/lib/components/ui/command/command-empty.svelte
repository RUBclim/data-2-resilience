<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let { class: className = undefined, children, ...rest }: CommandPrimitive.EmptyProps = $props();
</script>

<CommandPrimitive.Empty class={cn('py-6 text-center text-sm', className)} {...rest}>
	{@render children?.()}
</CommandPrimitive.Empty>
