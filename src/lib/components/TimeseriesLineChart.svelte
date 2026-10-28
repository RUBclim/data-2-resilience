<script lang="ts">
	import { LL, locale } from '$i18n/i18n-svelte';
	import { stations } from '$lib/stores/mapData';
	import { unit, unitOnly } from '$lib/stores/uiStore';
	import { cn } from '$lib/utils';
	import { CHART_COLORS } from '$lib/utils/chartUtils';
	import { getColorScaleValue } from '$lib/utils/colorScaleUtil';
	import {
		getHealthRiskByKey,
		getHealthRiskKeyByValue,
		getHealthRiskPill,
		isHealthRiskUnit
	} from '$lib/utils/healthRisksUtil';
	import {
		getHeatStressCategoryByValue,
		getHeatStressValueByCategory,
		valueToCategoryMap
	} from '$lib/utils/heatStressCategoriesUtil';
	import { getHeatStressLabel } from '$lib/utils/textUtil';
	import { scaleLinear, type ScaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
	import {
		Axis,
		Chart,
		Highlight,
		Legend,
		LinearGradient,
		Rect,
		Spline,
		Svg,
		Tooltip
	} from 'layerchart';
	import { LoaderCircle } from 'lucide-svelte';
	import ErrorAlert from './ErrorAlert.svelte';
	import { tooltipClasses } from './Histogram/HistogramTooltip.svelte';

	type DataRecord = Record<string, string | number> & {
		date: Date;
	};

	type Props = {
		data?: DataRecord[];
		error?: Error | null;
		max: number | null;
		min: number | null;
		isLoading?: boolean;
		isOrdinal?: boolean;
	};
	const { data = [], error, isLoading, isOrdinal, min, max }: Props = $props();

	const stationNames = $derived(
		Object.keys(data[0] || {})
			.filter((k) => k !== 'date')
			.sort((a, b) => a.localeCompare(b, $locale))
	);
	const yDomain = $derived.by(() => {
		if (isOrdinal) {
			return [
				getHeatStressValueByCategory('extreme cold stress'),
				getHeatStressValueByCategory('extreme heat stress')
			];
		}
		if (data.length === 0) return [0, 100];
		const min = data.reduce(
			(acc, item) => {
				const itemsMinVal = Math.min(...Object.values(item).filter((d) => typeof d === 'number'));
				if (acc === null) return itemsMinVal;
				return itemsMinVal < acc ? itemsMinVal : acc;
			},
			null as null | number
		);
		const max = data.reduce(
			(acc, item) => {
				const itemsMaxVal = Math.max(...Object.values(item).filter((d) => typeof d === 'number'));
				if (acc === null) return itemsMaxVal;
				return itemsMaxVal > acc ? itemsMaxVal : acc;
			},
			null as null | number
		);
		return [min, max];
	});
	const xScale = scaleTime();
	const yScale = scaleLinear();
	const cScale = $derived(scaleOrdinal().domain(stationNames).range(CHART_COLORS));
	const xTickFormat = $derived((d: Date) =>
		new Intl.DateTimeFormat($locale, { dateStyle: 'short' }).format(d)
	);
	const yTickFormat = $derived((d: number) =>
		isOrdinal
			? `${getHeatStressLabel({
					unit: $unit,
					LL: $LL,
					value: getHeatStressCategoryByValue(d)
				})}`
			: d.toLocaleString($locale, {
					maximumFractionDigits: 1
				})
	);
	const isHealthUnit = $derived(isHealthRiskUnit($unit));
	const tooltipTemplate = $derived((d: DataRecord) => {
		return `
			<span class="flex flex-col text-xs chart-export-ignore">
				<strong class="pb-1 mb-1 border-b border-border text-sm">
					${new Intl.DateTimeFormat($locale, { dateStyle: 'long', timeStyle: 'short', hour12: false }).format(d.date)}
				</strong>
				<span class="${cn(
					`grid gap-x-1 gap-y-0.5 items-center`,
					isHealthUnit ? `grid-cols-[1fr_auto_auto_auto]` : `grid-cols-[1fr_auto]`
				)}">
					${stationNames
						.filter((name) => typeof d[name as keyof typeof d] === 'number')
						.map((name) => {
							let value = d[name as keyof typeof d] as number | string;
							const idx = stationNames.indexOf(name);
							const heatStressPill = getHealthRiskPill({
								value,
								unit: $unit,
								LL: $LL,
								withLabel: false,
								min,
								max
							});
							const healthRiskKey = getHealthRiskKeyByValue({
								value,
								unit: $unit as 'utci' | 'pet'
							});
							let healthRiskLabel = '';
							if (healthRiskKey) {
								const healthRisk = getHealthRiskByKey({ key: healthRiskKey, unit: $unit, LL: $LL });
								healthRiskLabel = healthRisk?.title || '';
							}
							const val =
								typeof value === 'number' && !isOrdinal
									? value.toLocaleString($locale, { maximumFractionDigits: 1 })
									: null;
							return `
								<span class="inline-grid leading-tight pr-4 grid-cols-[auto_1fr] max-w-40 truncate items-center">
									${CHART_COLORS[idx] && `<span style="background-color: ${CHART_COLORS[idx]}" class="inline-block w-3 h-0.5 mr-2"></span>`}
									<span class="truncate inline-block whitespace-nowrap">${name}</span>
								</span>
								<span>
									${!isOrdinal ? val || `<span class="text-muted-foreground">${$LL.pages.measurements.noValueMeasured()}</span>` : ''}
									${$unitOnly}
								</span>
								${isHealthUnit ? `${heatStressPill}<span class="whitespace-nowrap">${healthRiskLabel}</span>` : ''}
							`;
						})
						.join('')}
				</span>
			</span>
		`;
	});
	const catAsideWidth = $derived(isHealthUnit ? 8 : 0);
	const padding = $derived({
		top: 8,
		left: isOrdinal ? 150 : 40,
		bottom: 48 + Math.ceil(stationNames.length / 3) * 14,
		right: 8 + catAsideWidth
	});
</script>

<div class={cn('group relative h-[360px] w-full')} id="linechart-container">
	{#if data && data.length > 0 && !error}
		<Chart
			{data}
			x="date"
			{yDomain}
			{xScale}
			{yScale}
			yNice={!isOrdinal}
			{padding}
			tooltip={{ mode: 'bisect-x' }}
			let:yScale={chartYScale}
			let:width
			let:height
		>
			{@const scaleY = chartYScale as ScaleLinear<number, number>}
			{@const scaleYDomain = scaleY.domain()}
			<Svg>
				<Axis
					placement="left"
					rule
					grid
					classes={{ tickLabel: 'text-xs' }}
					tickLabelProps={{ dx: -8 }}
					format={yTickFormat}
					ticks={isOrdinal ? valueToCategoryMap.size : undefined}
				/>
				<Axis
					placement="bottom"
					format={xTickFormat}
					rule
					classes={{ tickLabel: 'text-xs' }}
					tickLabelProps={{ dy: 8 }}
					ticks={4}
				/>
				{#if isOrdinal}
					{#each valueToCategoryMap.entries() as [val, key]}
						{@const seriesHeight = Math.ceil(height / valueToCategoryMap.size) + 3}
						{@const color = getColorScaleValue({ unit: $unit, LL: $LL, value: key, min, max })}
						<Rect
							x={width + catAsideWidth}
							y={scaleY(val) - seriesHeight / 2}
							width={catAsideWidth}
							height={Math.abs(seriesHeight)}
							class="no-stroke"
							fill={color}
						/>
					{/each}
				{:else if isHealthUnit}
					{@const minVal = yDomain[0] || scaleYDomain[0]}
					{@const maxVal = yDomain[1] || scaleYDomain[1]}
					{@const ticksCount = 10}
					{@const colorTicks = [
						...Array.from({ length: ticksCount }, (_, i) => {
							const tickStep = Math.round(Math.abs(maxVal - minVal) / ticksCount);
							if (i === 0) return minVal;
							if (i === ticksCount - 1) return maxVal;
							return minVal + i * tickStep;
						})
					]}
					<LinearGradient
						stops={colorTicks.toReversed().map((d) =>
							getColorScaleValue({
								unit: $unit,
								LL: $LL,
								value: d,
								min,
								max
							})
						)}
						vertical
						units="objectBoundingBox"
						let:gradient
					>
						<Rect
							x={width + catAsideWidth}
							y={scaleY(yDomain[1] || scaleYDomain[1])}
							width={catAsideWidth}
							height={scaleY(yDomain[0] || scaleYDomain[0]) - scaleY(yDomain[1] || scaleYDomain[1])}
							class="no-stroke"
							fill={gradient}
						/>
					</LinearGradient>
				{/if}
				{#each stationNames as name, idx}
					<Spline {data} class="stroke-2" stroke={CHART_COLORS[idx]} y={(d) => d[name]} x="date" />
				{/each}
				{#each stationNames as name, idx}
					<Highlight y={(d) => d[name]} points={{ fill: CHART_COLORS[idx] }} />
				{/each}
				<Highlight lines points />
			</Svg>

			<Legend
				scale={cScale}
				variant="swatches"
				tickFormat={(d) =>
					$stations.features.find((f) => f.properties.id === d)?.properties.longName || d}
				classes={{
					root: 'absolute inset-x-0 bottom-0',
					swatches: 'items-center justify-center w-full flex flex-wrap gap-x-4',
					swatch: 'w-3 h-0.5',
					item: () => 'flex items-center gap-x-2',
					label: 'chart-legend-label' // Needed to correct a shift in the chart export
				}}
			/>
			<Tooltip.Root
				let:data
				classes={{
					...tooltipClasses,
					root: cn(tooltipClasses.root, isHealthUnit && !isOrdinal ? 'w-80' : 'w-64', 'mt-24')
				}}
				xOffset={isHealthUnit && !isOrdinal ? -80 : 10}
				anchor={'right'}
				contained="window"
			>
				{@html tooltipTemplate(data)}
			</Tooltip.Root>
		</Chart>
	{:else if !error && !isLoading && data && data.length === 0}
		<div class="absolute inset-0 flex items-center justify-center">
			{$LL.pages.measurements.noDataAvailable()}
		</div>
	{/if}
	{#if error && !isLoading}
		<div class="absolute inset-0 flex items-center justify-center">
			<ErrorAlert errorObject={error} />
		</div>
	{/if}
	<div
		class={cn(
			'absolute inset-0 flex items-center justify-center',
			'pointer-events-none z-50 bg-background/50 opacity-0',
			isLoading && 'opacity-100'
		)}
	>
		<LoaderCircle class="size-6 animate-spin" />
	</div>
</div>
