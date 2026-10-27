<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let { class: className = undefined, children, ...rest }: DialogPrimitive.TitleProps = $props();
</script>

<DialogPrimitive.Title
	class={cn('text-lg leading-none font-semibold tracking-tight', className)}
	{...rest}
>
	{@render children?.()}
</DialogPrimitive.Title>
