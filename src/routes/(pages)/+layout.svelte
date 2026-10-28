<script lang="ts">
	import { setLocale } from '#i18n/i18n-svelte.js';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import Head from '#lib/components/head.svelte';
	import { ModeWatcher } from 'mode-watcher';

	import '../../app.css';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	// at the very top, set the locale before you access the store and before the actual rendering takes place
	// svelte-ignore state_referenced_locally
	data && setLocale(data.locale);
</script>

<Head />
<ModeWatcher />

<div class="grid h-screen w-screen grid-rows-[auto_1fr] overflow-clip">
	<QueryClientProvider client={data?.queryClient}>
		{@render children?.()}
		<SvelteQueryDevtools />
	</QueryClientProvider>
</div>
