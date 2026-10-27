<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { isNestedInPortal } from '../portal.js';

	let { children, ...rest }: DialogPrimitive.PortalProps = $props();

	// floating content in the dialog stays in it, as with bits-ui 0.x
	isNestedInPortal();
</script>

<DialogPrimitive.Portal {...rest}>
	{@render children?.()}
</DialogPrimitive.Portal>
