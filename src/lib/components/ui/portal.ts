import { getContext, setContext } from 'svelte';

const portalledKey = Symbol('portalled');

/**
 * bits-ui 0.x (melt-ui) portalled floating content to the body, but kept content that is nested in
 * other portalled content (e.g. a tooltip in a dropdown menu) in place, where it is laid out within
 * its parent. bits-ui 2 always portals: the content components call this to keep the old behavior,
 * and pass the result as `disabled` to their portal.
 */
export function isNestedInPortal() {
	const nested = getContext<boolean>(portalledKey) ?? false;
	setContext(portalledKey, true);
	return nested;
}
