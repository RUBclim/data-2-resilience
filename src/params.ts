import { defineParams } from '@sveltejs/kit/params';
// SvelteKit loads this file with node itself (no vite): import with the real file extension
import { isLocale } from '#i18n/i18n-util.ts';

export const params = defineParams({
	// only accept valid languages as a segment in the URL
	lang: (param) => (isLocale(param) ? param : undefined)
});
