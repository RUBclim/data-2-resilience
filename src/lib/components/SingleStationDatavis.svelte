<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import { unit, unitOnly } from '#lib/stores/uiStore.js';
	import { getColorScaleValue } from '#lib/utils/colorScaleUtil.js';
	import { getHealthRiskKeyByValue } from '#lib/utils/healthRisksUtil.js';

	type Props = {
		isLoading: boolean;
		label: string | undefined;
		value: string | number | undefined;
		/** the range of the color scale, as for the other stations */
		min: number | null;
		max: number | null;
	};

	const { isLoading, label, value, min, max }: Props = $props();

	const color = $derived(
		value &&
			getColorScaleValue({
				unit: $unit,
				LL: $LL,
				value,
				min,
				max
			})
	);

	const isHealthRiskUnit = $derived($unit === 'utci' || $unit === 'pet');
	const healthRisks = $derived($LL.map.choroplethLegend.healthRisks);
	const healthRiskKey = $derived(
		isHealthRiskUnit &&
			typeof value === 'number' &&
			getHealthRiskKeyByValue({ value, unit: $unit as 'utci' | 'pet' })
	);
	const healthRiskLabel = $derived(
		healthRiskKey
			? healthRisks[healthRiskKey as keyof typeof healthRisks].title.thermalComfort()
			: ''
	);
</script>

<div class="relative flex flex-col items-center justify-center gap-2 pt-2 pb-6">
	<strong class="flex items-center justify-center gap-2 text-3xl leading-tight">
		{#if isLoading}
			<span class="inline-block h-6 w-24 animate-pulse rounded-sm bg-muted-foreground/20"></span>
		{:else if label !== undefined}
			{#if typeof value === 'string'}
				<span
					class="inline-block size-6 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
					style={`background-color: ${color}`}
				></span>
			{/if}
			{label}
			{$unitOnly}
		{/if}
	</strong>
	{#if isHealthRiskUnit}
		<p class="flex items-center gap-x-2 text-xl">
			<span
				class="inline-block size-4 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
				style={`background-color: ${color}`}
			></span>
			{healthRiskLabel}
		</p>
	{/if}
</div>
