<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Frown } from 'lucide-svelte';
	import { Alert } from './ui/alert';

	interface Props {
		errorObject: Error | undefined | null;
		label?: string;
		description?: string;
	}

	let {
		errorObject,
		label = $LL.errors.unexpectedError.label(),
		description = $LL.errors.unexpectedError.description()
	}: Props = $props();
</script>

<Alert class="flex max-h-72 max-w-sm flex-col gap-2 overflow-y-auto" variant="destructive">
	<strong class="flex items-center gap-2">
		<Frown class="inline-block size-6 shrink-0" />
		<span class="mt-1">{label}</span>
	</strong>
	{description}
	{#if errorObject}
		<p class="overflow-auto rounded-sm border border-black/10 bg-black/5 p-3 font-mono text-sm">
			{errorObject.message.trim()}
		</p>
	{/if}
</Alert>
