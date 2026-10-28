<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { Command as CommandPrimitive } from 'bits-ui';

	let { class: className = undefined, children, ...rest }: CommandPrimitive.GroupProps = $props();
</script>

<CommandPrimitive.Group
	class={cn(
		'text-foreground **:data-command-group-heading:text-muted-foreground',
		'max-h-96 overflow-hidden overflow-y-auto p-1',
		'**:data-command-group-heading:px-2',
		'**:data-command-group-heading:py-1.5',
		'**:data-command-group-heading:text-xs **:data-command-group-heading:font-medium',
		className
	)}
	{...rest}
>
	<!-- the items element (role="group") was part of the group in cmdk-sv -->
	<CommandPrimitive.GroupItems>
		{@render children?.()}
	</CommandPrimitive.GroupItems>
</CommandPrimitive.Group>
