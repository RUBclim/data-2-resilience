<script lang="ts">
	import { browser } from '$app/env';
	import { refreshAll } from '$app/navigation';
	import { page } from '$app/state';
	import { locale, setLocale } from '#i18n/i18n-svelte.js';
	import type { Locales } from '#i18n/i18n-types.js';
	import { locales } from '#i18n/i18n-util.js';
	import { loadLocaleAsync } from '#i18n/i18n-util.async.js';
	import { cn } from '#lib/utils.js';
	import { replaceLocaleInUrl } from '../../utils';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '#lib/components/ui/dropdown-menu/index.js';
	import { Button } from './ui/button';

	const switchLocale = async (newLocale: Locales, updateHistoryState = true) => {
		if (!newLocale || $locale === newLocale) return;

		// load new dictionary from server
		await loadLocaleAsync(newLocale);

		// select locale
		setLocale(newLocale);

		if (updateHistoryState) {
			// update url to reflect locale changes
			history.pushState({ locale: newLocale }, '', replaceLocaleInUrl(page.url, newLocale));
		}

		// run the `load` function again
		refreshAll();
	};

	// update `lang` attribute
	$effect(() => {
		browser && document.querySelector('html')!.setAttribute('lang', $locale);
	});

	// update locale when navigating via browser back/forward buttons
	const handlePopStateEvent = async ({ state }: PopStateEvent) => switchLocale(state.locale, false);

	// update locale when page store changes
	$effect(() => {
		if (browser) {
			const lang = page.params.lang as Locales;
			switchLocale(lang, false);
			history.replaceState(
				{ ...history.state, locale: lang },
				'',
				replaceLocaleInUrl(page.url, lang)
			);
		}
	});

	function getLocaleName(l: string) {
		const localeFullName = new Intl.DisplayNames([l], { type: 'language' });
		return localeFullName.of(l);
	}
</script>

<svelte:window onpopstate={handlePopStateEvent} />

<DropdownMenu>
	<DropdownMenuTrigger class={cn('focusable')}>
		<Button size="icon" variant="outline">
			{$locale.toUpperCase()}
		</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent class="w-fit min-w-0">
		{#each locales as l}
			<!-- bits-ui 2 menu items have no `href`: render the link of bits-ui 0.x ourselves -->
			<DropdownMenuItem class={cn(l === $locale && 'font-bold')}>
				{#snippet child({ props })}
					<a {...props} href={replaceLocaleInUrl(page.url, l)}>{getLocaleName(l)}</a>
				{/snippet}
			</DropdownMenuItem>
		{/each}
	</DropdownMenuContent>
</DropdownMenu>
