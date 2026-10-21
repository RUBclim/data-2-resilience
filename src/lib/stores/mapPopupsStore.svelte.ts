import type { Popup } from 'maplibre-gl';

let popup: Popup | undefined = $state();

export function addPopup(p: Popup) {
	popup = p;
}

export function closePopup() {
	if (!popup) return;
	popup.remove();
	popup = undefined;
}
