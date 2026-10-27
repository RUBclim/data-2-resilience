<!--
	Renders a component inside a QueryClientProvider: svelte-query 6 keeps the client under a private
	context key, so tests can't hand it over through the `context` option of `render` anymore.
-->
<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import type { Component } from 'svelte';

	// `Component<never>` accepts any component; its props are passed through as they are
	let {
		component,
		componentProps
	}: { component: Component<never>; componentProps: Record<string, unknown> } = $props();

	const Child = $derived(component as Component<Record<string, unknown>>);
</script>

<QueryClientProvider client={new QueryClient()}>
	<Child {...componentProps} />
</QueryClientProvider>
