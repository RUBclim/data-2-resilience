<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import { cn } from '#lib/utils.js';
	import { LoaderCircle } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import ErrorAlert from './ErrorAlert.svelte';

	type Props = {
		isLoading: boolean;
		isSuccess: boolean;
		error?: Error | null;
		data?: unknown[];
		children?: Snippet<[]>;
	};

	const { data, children, isLoading, isSuccess, error }: Props = $props();
</script>

{#if isLoading}
	<div
		class={cn(
			'absolute inset-0 flex items-center justify-center',
			'pointer-events-none opacity-100'
		)}
	>
		<LoaderCircle class="size-6 animate-spin" />
	</div>
{:else if isSuccess && data && data.length === 0}
	<div class="absolute inset-0 flex items-center justify-center">
		{$LL.pages.measurements.noDataAvailable()}
	</div>
{:else if error}
	<div class="absolute inset-0 flex items-center justify-center">
		<ErrorAlert errorObject={error} />
	</div>
{:else if isSuccess}
	{@render children?.()}
{/if}
