<script lang="ts">
	// This file should be placed in the same directory as your other map components
	// e.g., src/lib/components/map/ErrorBoundary.svelte or similar

	import { onDestroy, onMount } from 'svelte';

	let originalConsoleError: typeof console.error;

	/**
	 * This component serves as an error boundary specifically for AbortError
	 * It will prevent AbortError from being logged to the console
	 */
	onMount(() => {
		// Save original console.error
		originalConsoleError = console.error;

		// Override console.error to filter out AbortError
		console.error = function (...args: unknown[]) {
			if (args.length > 0) {
				// Check for AbortError in the stack trace
				const errorString = String(args[0]);
				if (errorString.includes('AbortError')) {
					// Simply don't log this error
					return;
				}
			}

			// Forward all other errors to original console.error
			return originalConsoleError.apply(console, args);
		};
	});

	onDestroy(() => {
		// Restore original console.error when component is destroyed
		if (originalConsoleError) {
			console.error = originalConsoleError;
		}
	});
</script>

<!-- No need for any markup, this component only provides functionality -->
<slot />
