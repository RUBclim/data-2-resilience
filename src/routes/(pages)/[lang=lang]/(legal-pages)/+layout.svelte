<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import Header from '#lib/components/Header.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Header title={$LL.siteNameShort()} subtitle={$LL.siteSubtitle()} />
{@render children?.()}
