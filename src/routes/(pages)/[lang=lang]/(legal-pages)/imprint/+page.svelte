<script lang="ts">
	import LL from '#i18n/i18n-svelte.js';
	import LegalLayout from '#lib/components/LegalLayout.svelte';
</script>

<LegalLayout title={$LL.pages.imprint.title()} content={$LL.pages.imprint.content()}></LegalLayout>
