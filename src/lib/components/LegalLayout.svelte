<script lang="ts">
	import { page } from '$app/state';
	import LL, { locale } from '#i18n/i18n-svelte.js';
	import { cn } from '#lib/utils.js';

	type Props = {
		title: string;
		content: string;
	};

	let { title, content }: Props = $props();

	let urlQuery = $derived(page.url.searchParams.toString());
</script>

<main class="h-[calc(100vh-var(--headerHeight,5rem))] w-screen overflow-x-clip overflow-y-auto">
	<div class="prose mx-auto h-auto px-6 py-16">
		<span class="mb-8 inline-flex items-baseline gap-2 text-muted-foreground">
			<span>←</span>
			<a
				href={`/${$locale}?${urlQuery}`}
				class={cn(
					'not-prose mb-2 text-base font-normal text-muted-foreground hover:underline',
					'decoration-muted-foreground underline-offset-2 transition hover:text-foreground'
				)}
			>
				{$LL.navigation.backToHome()}
			</a>
		</span>
		<h1>{title}</h1>
		{@html content}
	</div>
</main>
