<script lang="ts">
	import LL, { locale } from '$i18n/i18n-svelte';
	import SvelteSeo from 'svelte-seo';
	import { replaceLocaleInUrl } from '../../utils';
	import HeadHrefLangs from './HeadHrefLangs.svelte';
	import { page } from '$app/state';
	import { PUBLIC_VITE_BASE_URL as baseUrl } from '$env/static/public';
</script>

<svelte:head>
	<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
	<link rel="sitemap" type="application/xml" title="Sitemap" href={`${baseUrl}/sitemap.xml`} />
	<HeadHrefLangs />
</svelte:head>
<SvelteSeo
	title={$LL.siteNameLong()}
	description={$LL.siteDescription()}
	canonical={`${baseUrl}${replaceLocaleInUrl(page.url, $locale)}`}
	keywords={$LL.keywords()}
	manifest={`${baseUrl}/manifest.json`}
	openGraph={{
		title: $LL.siteNameLong(),
		description: $LL.siteDescription(),
		url: `${baseUrl}`,
		type: 'website',
		images: [
			{
				url: `${baseUrl}/social-images/og-image-horizontal.jpg`,
				width: 1200,
				height: 630,
				alt: $LL.headImages.og.large()
			},
			{
				url: `${baseUrl}/social-images/og-image-square.jpg`,
				width: 1200,
				height: 1200,
				alt: $LL.headImages.og.square()
			}
		],
		site_name: $LL.siteNameShort()
	}}
	twitter={{
		card: 'summary_large_image',
		site: `@${$LL.twitterHandle()}`,
		title: $LL.siteNameLong(),
		description: $LL.siteDescription(),
		image: `${baseUrl}/social-images/twitter-image-main.jpg`,
		imageAlt: $LL.headImages.twitter()
	}}
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: $LL.siteNameLong(),
		description: $LL.siteDescription(),
		url: `${baseUrl}`,
		author: {
			'@type': 'Organization',
			name: $LL.author()
		}
	}}
/>
