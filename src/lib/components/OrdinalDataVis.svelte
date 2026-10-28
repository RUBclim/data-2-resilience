<script lang="ts">
	import LL from '#i18n/i18n-svelte.js';
	import type { StationsGeoJSONType } from '#lib/stores/mapData.js';
	import { useStations } from '#lib/stores/stationsStore.js';
	import { unitWithoutCategory } from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import { getHealthRiskByKey } from '#lib/utils/healthRisksUtil.js';
	import HealthRiskPill from './HealthRiskPill.svelte';
	import {
		PopoverTooltip,
		PopoverTooltipContent,
		PopoverTooltipTrigger
	} from './ui/popover-tooltip';

	type Props = {
		isLoading: boolean;
		stations: StationsGeoJSONType;
		initialStationIds?: string[];
		data: {
			id: string;
			label: string;
			value: number | undefined;
		}[];
	};

	const { isLoading, stations, initialStationIds = [], data }: Props = $props();

	// svelte-ignore state_referenced_locally
	const ids = useStations({ stations });
</script>

<div class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
	{#if isLoading}
		{#each $ids as _d, i}
			<span
				class={cn(
					'inline-block h-5 w-40 animate-pulse rounded-sm bg-muted-foreground/20',
					['w-24', 'w-20', 'w-32'][i]
				)}
			>
			</span>
			<span class="grid grid-cols-[0.75rem_1fr] items-center gap-2">
				<span class={cn('inline-block size-3 animate-pulse rounded-full bg-muted-foreground/20')}>
				</span>
				<span
					class={cn(
						'inline-block h-5 w-40 animate-pulse rounded-sm bg-muted-foreground/20',
						['w-32', 'w-24', 'w-40'][i]
					)}
				>
				</span>
			</span>
		{/each}
	{:else}
		{#each data as d}
			{@const healthRisk =
				d.value &&
				getHealthRiskByKey({
					key: `${d.value}`,
					unit: $unitWithoutCategory,
					LL: $LL
				})}
			{@const correspondingFeature = stations.features.find((f) => f.properties.id === d.id)}
			{@const label = correspondingFeature?.properties.longName || d.label || d.id || ''}
			<strong class="max-w-48 font-semibold">{label}</strong>
			<PopoverTooltip openDelay={0} disableHoverableContent>
				<PopoverTooltipTrigger
					class={cn(
						'grid w-fit grid-cols-[0.75rem_1fr] items-center gap-2 text-left',
						d.value && 'transition-colors hover:text-muted-foreground'
					)}
				>
					<HealthRiskPill value={d.value} withLabel {stations} {initialStationIds} />
				</PopoverTooltipTrigger>
				{#if d.value}
					<PopoverTooltipContent class="max-w-72">
						{#if healthRisk}
							<strong class="flex gap-2 font-semibold">
								<span>{healthRisk.title}</span>
								{#if healthRisk.ranges}
									<span class="font-normal whitespace-nowrap text-muted-foreground">
										({healthRisk.ranges})
									</span>
								{/if}
							</strong>
							<span>{@html healthRisk.description}</span>
						{/if}
					</PopoverTooltipContent>
				{/if}
			</PopoverTooltip>
		{/each}
	{/if}
</div>
