<script lang="ts">
	import LL, { locale } from '$i18n/i18n-svelte';

	interface Props {
		status?: number;
		title: string;
		message: string;
		links?: { href: string; text: string }[];
	}

	let {
		status = 404,
		title,
		message,
		links = [
			{
				href: `/${$locale}`,
				text: $LL.errors.fourOhFour.homepageLinkText()
			}
		]
	}: Props = $props();
</script>

<main class="flex items-center justify-center">
	<div class="mx-auto max-w-md p-6 pb-[10vh]">
		<div class="mx-auto h-12 w-12 text-primary"></div>
		<h1 class="mt-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
			{status}
			<br />
			{title}
		</h1>
		<p class="mt-4 text-xl text-muted-foreground">
			{message}
		</p>
		{#if links.length > 0}
			<div class="mt-6 flex items-center gap-4">
				{#each links as link (link.href)}
					<a
						href={link.href}
						class="inline-flex items-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{link.text}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</main>
