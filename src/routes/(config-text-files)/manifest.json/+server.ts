import type { TranslationFunctions } from '$i18n/i18n-types.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({
	locals: { LL }
}: {
	locals: {
		LL: TranslationFunctions;
	};
}) {
	const body = manifest(LL);
	const response = new Response(body);
	response.headers.set('Cache-Control', 'max-age=0, s-maxage=3600');
	response.headers.set('Content-Type', 'application/manifest+json');
	return response;
}

const manifest = (LL: TranslationFunctions) => {
	return `
{
    "background_color": "${LL.themeColor()}",
    "theme_color": "${LL.themeColor()}",
    "display": "standalone",
    "description": "${LL.siteDescription()}",
    "icons": [
        { "src": "icons/manifest-icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "icons/manifest-icon-512.png", "sizes": "512x512", "type": "image/png" }
    ],
    "name": "${LL.siteNameLong()}",
    "short_name": "${LL.siteNameShort()}",
    "start_url": "./healingservices.html"
}
  `;
};
