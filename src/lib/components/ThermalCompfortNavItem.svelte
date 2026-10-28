<script module lang="ts">
	export type SelectedIndicatorSlugType =
		'relative_humidity' | 'utci' | 'utci_category' | 'air_temperature';
	export type IndicatorType = {
		slug: 'utci' | 'relative_humidity' | 'air_temperature';
		title: string;
		description: string;
		hasCategory: boolean;
		isSelected: boolean;
	};
</script>

<script lang="ts">
	import { PUBLIC_ENABLE_HEATATLAS_TIMESLIDER } from '$app/env/public';
	import { LL } from '#i18n/i18n-svelte.js';
	import { heatStressUnit, updateHeatStressUnit } from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import InfoTooltip from './InfoTooltip.svelte';

	const showTimeslider = PUBLIC_ENABLE_HEATATLAS_TIMESLIDER === 'true';

	interface Props {
		indicator: IndicatorType;
	}

	let { indicator }: Props = $props();

	let selectedIndicatorSlug = $derived($heatStressUnit === null ? 'utci' : $heatStressUnit);
	let slugWithCategory = $derived(`${indicator.slug}_category`);
	let valueSelected = $derived(indicator.isSelected && selectedIndicatorSlug !== slugWithCategory);
	let categorySelected = $derived(
		indicator.isSelected && selectedIndicatorSlug === slugWithCategory
	);
</script>

<li class="group/indicators relative focus-within:z-10">
	<div
		class={cn(
			'relative flex w-full flex-col bg-background p-4 text-left',
			'transition hover:bg-muted ',
			'group-first-of-type/indicators:rounded-t-xl',
			!showTimeslider && 'group-last-of-type/indicators:rounded-b-xl',
			indicator.isSelected && indicator.hasCategory && 'pb-5'
		)}
	>
		<button
			aria-label={indicator.title}
			type="button"
			onclick={() => {
				updateHeatStressUnit(indicator.hasCategory ? slugWithCategory : indicator.slug);
			}}
			class={cn(
				'absolute inset-0 z-10 focusable focus-visible:rounded-xl focus-visible:bg-transparent'
			)}
		></button>
		<div class="relative flex w-full items-center justify-between gap-4 pr-8 font-semibold">
			<div class="inline-flex items-center gap-1.5">
				{indicator.title}
				<InfoTooltip
					title={indicator.title}
					description={indicator.description}
					class="relative z-20"
				/>
			</div>
			<span
				class={cn(
					'absolute top-0 right-0 bg-background',
					'size-5 rounded-full border border-muted-foreground ring-4 ring-background ring-inset',
					indicator.isSelected && 'border-primary bg-primary-foreground ring-primary'
				)}
			></span>
		</div>
		{#if indicator.hasCategory && indicator.isSelected}
			<nav class="mt-2">
				<ul class="inline-flex gap-px rounded bg-border">
					<li class="group/utci flex">
						<button
							type="button"
							onclick={(evt) => {
								evt.preventDefault();
								evt.stopPropagation();
								updateHeatStressUnit(slugWithCategory);
							}}
							class={cn(
								'border border-r-0 border-border px-3 py-1.5 text-center',
								'rounded-l bg-background transition group-hover/indicators:bg-muted',
								'focusable focus-visible:z-10 focus-visible:rounded focus-visible:border',
								'relative z-20',
								categorySelected &&
									'border-primary bg-primary font-semibold text-primary-foreground group-hover/indicators:bg-primary group-hover/indicators:text-primary-foreground',
								!categorySelected && 'hover:group-hover/indicators:bg-background'
							)}
						>
							{$LL.indicators.utci.types.byClass.title()}
						</button>
					</li>
					<li class="group/utci flex">
						<button
							type="button"
							onclick={(evt) => {
								evt.preventDefault();
								evt.stopPropagation();
								updateHeatStressUnit(indicator.slug);
							}}
							class={cn(
								'border border-l-0 border-border px-3 py-1.5 text-center',
								'rounded-r bg-background transition group-hover/indicators:bg-muted',
								'focusable focus-visible:z-10 focus-visible:rounded focus-visible:border',
								'relative z-20',
								valueSelected &&
									'border-primary bg-primary font-semibold text-primary-foreground group-hover/indicators:bg-primary group-hover/indicators:text-primary-foreground',
								!valueSelected && 'hover:group-hover/indicators:bg-background'
							)}
						>
							{$LL.indicators.utci.types.byValue.title()}
						</button>
					</li>
				</ul>
			</nav>
		{/if}
	</div>
</li>
