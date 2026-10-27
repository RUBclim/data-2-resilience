<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let {
		class: className = undefined,
		children,
		...rest
	}: DialogPrimitive.DescriptionProps = $props();
</script>

<DialogPrimitive.Description class={cn('text-sm text-muted-foreground', className)} {...rest}>
	{@render children?.()}
</DialogPrimitive.Description>
