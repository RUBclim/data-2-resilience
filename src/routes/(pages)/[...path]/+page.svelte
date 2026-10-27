<script lang="ts">
	import LL from '#i18n/i18n-svelte.js';
	import ErrorPage from '#lib/components/ErrorPage.svelte';
</script>

<ErrorPage
	status={404}
	title={$LL.errors.fourOhFour.label()}
	message={$LL.errors.fourOhFour.description()}
/>
