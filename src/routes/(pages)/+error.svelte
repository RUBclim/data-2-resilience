<script lang="ts">
	import { page } from '$app/state';
	import LL from '#i18n/i18n-svelte.js';
	import ErrorPage from '#lib/components/ErrorPage.svelte';
</script>

<ErrorPage
	status={page.status}
	title={$LL.errors.unexpectedError.label()}
	message={$LL.errors.unexpectedError.description()}
/>
