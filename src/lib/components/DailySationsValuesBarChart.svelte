<script lang="ts">
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import { type StationsGeoJSONType } from '#lib/stores/mapData.js';
	import { useStations } from '#lib/stores/stationsStore.js';
	import {
		datavisType,
		formattedTimeConfiguration,
		isCategoryUnit,
		minMaxAvg,
		unit,
		unitLabel,
		unitOnly,
		unitWithMinMaxAvg,
		updateMinMaxAvg
	} from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import { getColorScaleValue } from '#lib/utils/colorScaleUtil.js';
	import { getHealthRiskKeyByValue, isHealthRiskUnit } from '#lib/utils/healthRisksUtil.js';
	import {
		getMessageForUnavailableStations,
		getMessageForUnsupportedStations
	} from '#lib/utils/stationsDataVisUtil.js';
	import { getHeatStressLabel } from '#lib/utils/textUtil.js';
	import { useStationsSnapshotConfig } from '#lib/utils/useStationsSnapshot.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { BarChart, Highlight, Tooltip } from 'layerchart';
	import { TriangleAlert } from '@lucide/svelte';
	import ChartExportDropdown from './ChartExportDropdown.svelte';
	import ChartQueryHull from './ChartQueryHull.svelte';
	import Combobox from './Combobox.svelte';
	import { tooltipClasses } from './Histogram/HistogramTooltip.svelte';
	import OrdinalDataVis from './OrdinalDataVis.svelte';
	import SingleStationDatavis from './SingleStationDatavis.svelte';
	import { Alert } from './ui/alert';

	interface Props {
		stations: StationsGeoJSONType;
		initialStationIds?: string[];
	}

	const { stations, initialStationIds = [] }: Props = $props();

	let isExporting = $state(false);

	// svelte-ignore state_referenced_locally
	const ids = useStations({ initialStationIds, stations });
	const stationsSnapshotConfig = $derived.by(() =>
		useStationsSnapshotConfig({ initialStationIds, stations })
	);
	const query = createQuery(() => $stationsSnapshotConfig);

	const getValue = $derived(
		<T,>(item: Record<string, unknown>) => item[$unitWithMinMaxAvg as keyof typeof item] as T
	);
	const data = $derived(
		$ids
			.map((id) => {
				const label =
					stations.features.find((f) => f.properties.id === id)?.properties.longName || id;
				const item = (query.data?.items || []).find((d) => d.id === id);
				if (!item) {
					return {
						id,
						value: undefined,
						supported: false,
						dataAvailable: false,
						label
					};
				}
				const value = getValue<number>(item);
				return {
					id,
					value,
					supported: typeof value !== 'undefined',
					dataAvailable: typeof value !== 'undefined' && value !== null,
					label
				};
			})
			.sort((a, b) => a.label.localeCompare(b.label))
	);

	const insufficientDataIds = $derived(
		data.filter((d) => d.supported && !d.dataAvailable).map((d) => d.id)
	);

	const unsupportedIds = $derived(data.filter((d) => !d.supported).map((d) => d.id));
	const unsupportedMsg = $derived(
		getMessageForUnsupportedStations({
			ids: $ids,
			unsupportedIds,
			unit: $unit,
			stations: stations.features,
			LL: $LL
		})
	);

	const unavailableIds = $derived(
		data.filter((d) => d.supported && !d.dataAvailable).map((d) => d.id)
	);
	const unavailableMsg = $derived(
		getMessageForUnavailableStations({
			ids: $ids,
			unavailableIds,
			unit: $unit,
			stations: stations.features,
			LL: $LL
		})
	);
	const validStations = $derived(data.filter((d) => d.supported && d.dataAvailable));
	const validIds = $derived(validStations.map((d) => d.id));

	const firstValidValue = $derived(validStations[0]?.value as number | string | undefined);
	const firstValidValueLabel = $derived(
		typeof firstValidValue === 'string'
			? getHeatStressLabel({ unit: $unit, LL: $LL, value: firstValidValue })
			: firstValidValue?.toLocaleString($locale, { maximumFractionDigits: 1 })
	);

	const chartHeight = $derived(Math.max(96, 60 + $ids.length * 22));
	const unsupportedDataItems = $derived(data.filter((d) => unsupportedIds.includes(d.id)));

	const heatStressColorByValue = $derived((val: number) => {
		return getColorScaleValue({
			unit: $unit,
			LL: $LL,
			value: val,
			min: query.data?.scaleMin ?? null,
			max: query.data?.scaleMax ?? null
		});
	});

	const isHealthUnit = $derived(isHealthRiskUnit($unit));
	const healthRisks = $derived($LL.map.choroplethLegend.healthRisks);
	const isLoading = $derived(query.isLoading || isExporting);
	const showChart = $derived(
		validIds.length > 0 || isLoading || query.isError || (query.data?.items || []).length === 0
	);
</script>

{#snippet minMaxAvgCombobox()}
	{#if $datavisType === 'day' && !$isCategoryUnit && !$unit.startsWith('maximum_wind_speed')}
		<Combobox
			defaultValue={$minMaxAvg}
			onChange={(value) => updateMinMaxAvg(value as 'min' | 'avg' | 'max')}
			classes={{ trigger: 'w-fit chart-export-ignore' }}
			options={[
				{
					value: 'min',
					label: $LL.pages.measurements.minMaxAvgSelect.min()
				},
				{
					value: 'avg',
					label: $LL.pages.measurements.minMaxAvgSelect.avg()
				},
				{
					value: 'max',
					label: $LL.pages.measurements.minMaxAvgSelect.max()
				}
			]}
		/>
	{/if}
{/snippet}

{#if unsupportedMsg && !isLoading}
	<Alert variant="default" class="chart-export-ignore border-muted-foreground bg-muted/50">
		{#snippet icon()}
			<TriangleAlert class="size-5 shrink-0 text-muted-foreground" />
		{/snippet}
		{@html unsupportedMsg}
	</Alert>
{/if}
{#if unavailableMsg && !isLoading}
	<Alert variant="warning" class="chart-export-ignore">
		{@html unavailableMsg}
	</Alert>
{/if}

<h3 class="grid grid-cols-[1fr_auto] items-center gap-x-8 gap-y-2 font-semibold">
	<span class="flex flex-col gap-x-2 gap-y-0.5 font-semibold">
		{$unitLabel}
		{$unitOnly ? `(${$unitOnly})` : ''}
		<span class="text-sm font-normal text-muted-foreground">
			{$formattedTimeConfiguration}
		</span>
	</span>
	<span class={cn('flex items-center gap-x-2')}>
		{@render minMaxAvgCombobox()}
		<ChartExportDropdown
			disableExport={!showChart}
			chartExportFilename="stations-barchart"
			chartExportId="stations-datavis"
			onChartExportStart={() => (isExporting = true)}
			onChartExportEnd={() => (isExporting = false)}
		/>
	</span>
</h3>
{#if $ids.length === 1 && typeof firstValidValue !== 'undefined' && firstValidValue !== null}
	<SingleStationDatavis
		isLoading={query.isLoading}
		label={firstValidValueLabel}
		value={firstValidValue}
		min={query.data?.scaleMin ?? null}
		max={query.data?.scaleMax ?? null}
	/>
{:else if showChart}
	{#if $isCategoryUnit}
		<OrdinalDataVis {data} {isLoading} {stations} {initialStationIds} />
	{:else}
		<div class={cn('group relative')} style={`height: ${chartHeight}px`}>
			<ChartQueryHull
				isSuccess={query.isSuccess}
				error={query.error}
				data={validStations}
				{isLoading}
			>
				<BarChart
					data={validStations}
					bandPadding={0.3}
					x="value"
					y="label"
					orientation="horizontal"
					padding={{
						left: Math.min(130, Math.max(...data.map((d) => d.label.length)) * 8) + 24,
						right: 16,
						bottom: 24
					}}
					props={{
						yAxis: {
							tickLength: 0,
							tickLabelProps: {
								dx: -8
							},
							classes: {
								tickLabel: 'fill-muted-foreground text-xs',
								rule: 'stroke-primary'
							},
							format: (v?: string) =>
								(v?.length || 0) > 130 / 8 ? (v || '').slice(0, 130 / 8) + '...' : v || ''
						},
						xAxis: {
							classes: {
								tickLabel: 'fill-muted-foreground text-xs',
								rule: 'stroke-muted'
							},
							format: (v?: number) => (v === 0 ? '' : `${v?.toLocaleString($locale)}`),
							ticks: 4
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
					}}
				>
					{#snippet tooltip()}
						<Tooltip.Root
							classes={{
								...tooltipClasses,
								root: cn(tooltipClasses.root, 'w-48')
							}}
							contained="container"
							anchor="right"
							portal={false}
						>
							{#snippet children({ data: d })}
								{@const healthRiskKey =
									isHealthUnit &&
									getHealthRiskKeyByValue({ value: d.value, unit: $unit as 'utci' | 'pet' })}
								{@const healthRiskLabel = healthRiskKey
									? healthRisks[healthRiskKey as keyof typeof healthRisks].title.thermalComfort()
									: ''}
								<span class={cn('flex max-w-48 flex-col text-xs')}>
									{@html unsupportedIds.includes(d.id) || insufficientDataIds.includes(d.id)
										? ''
										: `<strong>${d.label}</strong>`}
									<span
										class={cn(
											'flex items-center gap-x-1',
											!isHealthUnit && 'flex-row-reverse justify-end'
										)}
									>
										{@html cn(
											d.value !== undefined &&
												d.value.toLocaleString($locale, {
													maximumFractionDigits: 1
												})
										)}
										{@html d.value ? $unitOnly : ''}
										<span
											class="inline-block size-2.5 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
											style={`background-color: ${heatStressColorByValue(d.value)};`}
										></span>
										{#if isHealthUnit}
											{healthRiskLabel}
										{/if}
									</span>
								</span>
							{/snippet}
						</Tooltip.Root>
					{/snippet}
					{#snippet highlight()}
						{#each unsupportedDataItems as item}
							<Highlight
								lines={{
									class: 'stroke-foreground/5 stroke-20 [stroke-dasharray:1000,0]'
								}}
								data={item}
							></Highlight>
						{/each}
					{/snippet}
				</BarChart>
			</ChartQueryHull>
		</div>
	{/if}
{/if}
