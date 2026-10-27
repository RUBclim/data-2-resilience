<script lang="ts">
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import type { StationsGeoJSONType } from '#lib/stores/mapData.js';
	import { selectMultipleStations, useStations } from '#lib/stores/stationsStore.js';
	import {
		formattedTimeConfiguration,
		isCategoryUnit,
		unitLabel,
		unitOnly,
		unitWithMinMaxAvg
	} from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import { useStationsSnapshotConfig } from '#lib/utils/useStationsSnapshot.js';
	import { createQuery } from '@tanstack/svelte-query';
	import ChartExportDropdown from '#lib/components/ChartExportDropdown.svelte';
	import ChartQueryHull from '#lib/components/ChartQueryHull.svelte';
	import { bin } from 'd3-array';
	import { BarChart, Highlight, Tooltip } from 'layerchart';
	import HistogramTooltip, { tooltipClasses } from './HistogramTooltip.svelte';

	type Props = {
		stations: StationsGeoJSONType;
		initialStationIds?: string[];
	};

	type BaseItemType = {
		id: string;
	};

	type QuantitativeType = Array<BaseItemType> & {
		x0: number | undefined;
		x1: number | undefined;
	};
	type OrdinalType = BaseItemType & {
		value: number;
		label: string;
		ids: string[];
	};

	let { initialStationIds = [], stations }: Props = $props();

	let isExporting = $state(false);

	const allCategoryValues = $derived(Object.keys($LL.map.choroplethLegend.healthRisks));
	const allCategoryLabels = $derived(
		Object.values($LL.map.choroplethLegend.healthRisks).map(({ title }) => title.heatStress())
	);

	// svelte-ignore state_referenced_locally
	const ids = useStations({ initialStationIds, stations });
	const stationsSnapshotQueryConfig = $derived.by(() =>
		useStationsSnapshotConfig({ initialStationIds, stations })
	);
	const snapshotQuery = createQuery(() => $stationsSnapshotQueryConfig);

	const getValue = $derived(
		<T,>(item: Record<string, unknown>) => item[$unitWithMinMaxAvg as keyof typeof item] as T
	);
	const snapshotApiResponseData = $derived(
		(snapshotQuery.data?.items || []).filter((d) => {
			const value = getValue<number>(d);
			return typeof value !== 'undefined';
		})
	);

	const ordinalData = $derived(
		allCategoryValues.map((val, idx) => {
			const valuesWithThisCategory = snapshotApiResponseData.filter((v) => {
				const value = getValue(v);
				return value === val;
			});
			return {
				value: valuesWithThisCategory.length,
				label: allCategoryLabels[idx],
				ids: Array.from(new Set(valuesWithThisCategory.map((d) => d.id)))
			};
		})
	);

	const thresholds = $state(10);

	const binByValue = $derived(
		bin<(typeof snapshotApiResponseData)[0], number>().value(getValue).thresholds(thresholds)
	);
	// without any value, d3 returns a single empty bin with an undefined x0, which an axis cannot place
	const bins = $derived(binByValue(snapshotApiResponseData).filter((b) => b.x0 !== undefined));

	const selectedItems = $derived(
		$ids.map((id) => ({
			id,
			label: stations.features.find((f) => f.id === id)?.properties.longName || ''
		}))
	);

	type BarchartProps = Parameters<typeof BarChart>[1];
	const commonChartProps = $derived({
		bandPadding: 0.15,
		onTooltipClick(_e: MouseEvent, { data }: { data: unknown }) {
			if ($isCategoryUnit) {
				const item = data as OrdinalType;
				selectMultipleStations(item.ids);
			} else {
				const item = data as QuantitativeType;
				selectMultipleStations(item.map(({ id }) => id));
			}
		},
		props: {
			xAxis: {
				classes: {
					tickLabel: 'fill-muted-foreground text-xs',
					rule: 'stroke-muted'
				},
				format: (v) => {
					if (typeof v === 'number') return `${v?.toLocaleString($locale)}`;
					return v;
				},
				// every 4th category, or about 4 bins: explicit, since layerchart 2 reads a number as a
				// tick count (layerchart 0.99 labelled every n-th band)
				ticks: $isCategoryUnit
					? allCategoryLabels.filter((_, i) => i % 4 === 0)
					: bins.map((b) => b.x0).filter((_, i) => i % Math.ceil(bins.length / 4) === 0),
				// drop labels that would still overlap on narrow screens
				tickOcclusion: true
			},
			yAxis: {
				classes: {
					tickLabel: 'fill-muted-foreground text-xs',
					rule: 'stroke-muted'
				},
				tickLength: 0,
				format: (v?: number) => (v === 0 ? '' : `${v?.toLocaleString($locale)}`),
				ticks: 2
			},
			grid: {
				classes: {
					line: 'stroke-muted'
				}
			},
			rule: { x: 0 },
			bars: {
				strokeWidth: 0,
				radius: 2
			}
		}
	} satisfies BarchartProps);

	const binWithSelectedItems = $derived.by(() => {
		if (!$isCategoryUnit) {
			return bins.filter((bin) => bin.find((d) => selectedItems.find((s) => s.id === d.id)));
		}
		return ordinalData.filter((d) => d.ids.filter((id) => $ids.includes(id)).length > 0);
	});

	const isLoading = $derived(snapshotQuery.isLoading || isExporting);
</script>

{#snippet highlights()}
	{#each binWithSelectedItems as bin}
		<Highlight
			lines={{
				class: 'stroke-foreground stroke-2 [stroke-dasharray:3,6] [stroke-linecap:round]',
				marker: 'circle'
			}}
			data={bin}
		></Highlight>
	{/each}
{/snippet}

<h3 class="grid grid-cols-[auto_1fr] items-center gap-x-8">
	<span class="flex flex-col gap-x-8 gap-y-0.5">
		<strong class="font-semibold">{$LL.pages.measurements.histogram.title()}</strong>
		<span class="text-sm text-muted-foreground">
			{$formattedTimeConfiguration}
		</span>
	</span>

	<span class={cn('flex items-center justify-end gap-x-2')}>
		<span class="text-right text-sm font-normal text-muted-foreground">
			{$unitLabel}
			{$unitOnly ? `(${$unitOnly})` : ''}
		</span>
		<ChartExportDropdown
			chartExportFilename="stations-histogram"
			chartExportId="stations-histogram"
			onChartExportStart={() => (isExporting = true)}
			onChartExportEnd={() => (isExporting = false)}
		/>
	</span>
</h3>
<div class="group relative h-40" id="histogram-chart">
	<ChartQueryHull
		isSuccess={snapshotQuery.isSuccess}
		error={snapshotQuery.error}
		{isLoading}
		data={snapshotApiResponseData}
	>
		{#if $isCategoryUnit}
			<BarChart data={ordinalData} x="label" y="value" {...commonChartProps}>
				{#snippet tooltip()}
					<Tooltip.Root
						classes={tooltipClasses}
						contained="container"
						anchor="right"
						yOffset={-40}
						portal={false}
					>
						{#snippet children({ data })}
							<HistogramTooltip item={data} {selectedItems} type="ordinal" />
						{/snippet}
					</Tooltip.Root>
				{/snippet}
				{#snippet highlight()}
					{@render highlights()}
				{/snippet}
			</BarChart>
		{:else}
			<BarChart data={bins} x="x0" y="length" {...commonChartProps}>
				{#snippet tooltip()}
					<Tooltip.Root
						classes={tooltipClasses}
						contained="container"
						anchor="right"
						yOffset={-40}
						portal={false}
					>
						{#snippet children({ data })}
							<HistogramTooltip item={data} {selectedItems} type="quantitative" />
						{/snippet}
					</Tooltip.Root>
				{/snippet}
				{#snippet highlight()}
					{@render highlights()}
				{/snippet}
			</BarChart>
		{/if}
	</ChartQueryHull>
</div>

<style>
	:global(.lc-tooltip-rect) {
		transition: fill 100ms ease-out;
	}

	:global(#histogram-chart .lc-tooltip-rect:hover) {
		fill: hsl(var(--foreground) / 0.05);
		cursor: pointer;
	}
</style>
