// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			locale: Locales;
			LL: TranslationFunctions;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		/** only set in test builds (`vite build --mode test`), see Map.svelte */
		__D2R_MAP__?: import('maplibre-gl').Map;
	}
}

export {};
