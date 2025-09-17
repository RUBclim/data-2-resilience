import { baseLocale, locales } from '$i18n/i18n-util';
import { PUBLIC_VITE_BASE_URL } from '$env/static/public';

const site = PUBLIC_VITE_BASE_URL; // change this to reflect your domain
// populate this with all the slugs you wish to include
const pages: string[] = ['', 'heat-stress', 'stations', 'about', 'imprint', 'privacy-policy'];

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const body = sitemap(pages);
	const response = new Response(body);
	response.headers.set('Cache-Control', 'max-age=0, s-maxage=3600');
	response.headers.set('Content-Type', 'application/xml');
	return response;
}

const sitemap = (pages: string[]) => {
	return `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
  ${pages
		.map(
			(page) => `
  <url>
    <loc>${site}/${baseLocale}/${page}</loc>
    <xhtml:link rel="alternate" hreflang="${baseLocale}" href="${site}/${baseLocale}/${page}" />
    ${locales
			.filter((l) => l !== baseLocale)
			.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${site}/${l}/${page}" />`)
			.join('')}
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
  `
		)
		.join('')}
</urlset>`;
};
