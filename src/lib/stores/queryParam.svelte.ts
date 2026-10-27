import { browser } from '$app/env';
import { untrack } from 'svelte';
import { toStore, type Writable } from 'svelte/store';
import { queryParameters } from 'sveltekit-search-params';

type Option<T> = {
	encode: (value: T) => string | undefined;
	decode: (value: string | null) => T | null;
	defaultValue: T;
};
type NavigationOptions = NonNullable<Parameters<typeof queryParameters>[1]>;

/**
 * A store of one search param, like `queryParam` of sveltekit-search-params 3 (removed in 4).
 *
 * The params object of version 4 sets up effects: in the browser it is created in an effect root,
 * since the stores live in modules; on the server effects don't run and it is created directly.
 * Version 4 writes the default of a missing param to the url as soon as the object exists, version 3
 * only while the store had subscribers: the default is handled here to keep the latter.
 */
export function queryParam<T>(
	name: string,
	{ defaultValue, ...codec }: Option<T>,
	navigationOptions?: NavigationOptions
): Writable<T> {
	// its typings intersect every param with `string | null` (for params missing in the options)
	const create = () =>
		queryParameters({ [name]: codec }, navigationOptions) as Record<string, T | null>;
	let params!: Record<string, T | null>;
	if (browser) {
		$effect.root(() => {
			params = create();
		});
	} else {
		params = create();
	}

	const read = () => params[name] ?? defaultValue;
	const write = (value: T) => {
		params[name] = value;
	};

	if (!browser) {
		// `toStore` on the server keeps the value it was created with: the stores are module-level
		// and outlive requests, so read the url of the request being rendered on every subscription
		return {
			subscribe: (run) => {
				run(read());
				return () => {};
			},
			set: write,
			update: (updater) => write(updater(read()))
		};
	}

	// version 3 wrote the default without waiting for `debounceHistory`
	let defaults!: Record<string, T | null>;
	$effect.root(() => {
		defaults = queryParameters(
			{ [name]: codec },
			{ ...navigationOptions, debounceHistory: 0 }
		) as Record<string, T | null>;
	});

	const store = toStore(read, write);
	let subscribers = 0;
	let stopDefaulting: (() => void) | undefined;
	return {
		...store,
		subscribe: (run) => {
			if (subscribers++ === 0) {
				stopDefaulting = $effect.root(() => {
					$effect.pre(() => {
						if (params[name] == null) {
							untrack(() => {
								defaults[name] = defaultValue;
							});
						}
					});
				});
			}
			const unsubscribe = store.subscribe(run);
			return () => {
				unsubscribe();
				if (--subscribers === 0) stopDefaulting?.();
			};
		}
	};
}
