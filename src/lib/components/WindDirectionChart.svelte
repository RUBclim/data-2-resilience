<script lang="ts">
	import { LL, locale } from '$i18n/i18n-svelte';
	import { stations } from '$lib/stores/mapData';
	import { unit } from '$lib/stores/uiStore';
	import { cn } from '$lib/utils';
	import { CHART_COLORS } from '$lib/utils/chartUtils';
	import { scaleLinear, type ScaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
	import { Axis, Chart, Highlight, Legend, Svg, Tooltip } from 'layerchart';
	import { LoaderCircle } from 'lucide-svelte';
	import ErrorAlert from './ErrorAlert.svelte';
	import { tooltipClasses } from './Histogram/HistogramTooltip.svelte';

	type DataRecord = Record<string, string | number> & {
		date: Date;
	};

	type Props = {
		data?: DataRecord[];
		error?: Error | null;
		isLoading?: boolean;
	};
	const { data = [], error, isLoading }: Props = $props();

	const stationNames = $derived(
		Object.keys(data[0] || {})
			.filter((k) => k !== 'date')
			.sort((a, b) => a.localeCompare(b, $locale))
	);
	const xScale = scaleTime();
	const yScale = scaleLinear();
	const cScale = $derived(scaleOrdinal().domain(stationNames).range(CHART_COLORS));
	const xTickFormat = $derived((d: Date) =>
		new Intl.DateTimeFormat($locale, { dateStyle: 'short' }).format(d)
	);
	const unitOnly = $derived(
		`${$LL.pages.measurements.unitSelect.units[$unit as keyof typeof $LL.pages.measurements.unitSelect.units].unitOnly()}`
	);
	const yTickFormat = $derived(
		(d: number) => `${d.toLocaleString($locale, { maximumFractionDigits: 1 })}`
	);
	const tooltipTemplate = $derived((d: DataRecord) => {
		const heatStressColorPill = (val: number, stationIdx: number) => `
				<span
					class="size-2.5 inline-block relative transition all text-muted-foreground"
					style="transform: rotate(${val + 180}deg);"
				>
					<span
						class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-semibold"
						style="color: ${CHART_COLORS[stationIdx]};"
					>
						↑
					</span>
				</span>
			`;
		return `
			<span class="flex flex-col text-xs chart-export-ignore">
				<strong class="pb-1 mb-1 border-b border-border text-sm">
					${new Intl.DateTimeFormat($locale, { dateStyle: 'long', timeStyle: 'short', hour12: false }).format(d.date)}
				</strong>
				<span class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 items-center">
					${stationNames
						.filter((name) => typeof d[name as keyof typeof d] === 'number')
						.map((name, idx) => {
							const value = d[name as keyof typeof d] as number;
							const heatStressPill = heatStressColorPill(value, idx);
							return `
								<span class="flex items-center leading-tight">
									${CHART_COLORS[idx] && `<span style="background-color: ${CHART_COLORS[idx]}" class="inline-block w-3 h-0.5 mr-2"></span>`}
									${name}
								</span>
								${`<span class="whitespace-nowrap inline-flex items-center gap-1">
									${heatStressPill} ${Math.round(value).toLocaleString($locale)}
									${unitOnly}
								</span>`}
							`;
						})
						.join('')}
				</span>
			</span>
		`;
	});
	const padding = $derived({
		top: 0,
		left: 40,
		bottom: 48 + Math.ceil(stationNames.length / 3) * 14,
		right: 0
	});
</script>

<div class={cn('group relative h-[360px] w-full')} id="linechart-container">
	{#if data && data.length > 0 && !error}
		<Chart
			{data}
			x="date"
			yDomain={[0, 360]}
			{xScale}
			{yScale}
			yNice
			{padding}
			tooltip={{ mode: 'bisect-x' }}
			let:yScale={chartYScale}
			let:xScale={chartXScale}
		>
			{@const scaleY = chartYScale as ScaleLinear<number, number>}
			{@const scaleX = chartXScale as ScaleLinear<number, number>}
			<Svg>
				<Axis
					placement="left"
					rule
					grid
					classes={{ tickLabel: 'text-xs' }}
					tickLabelProps={{ dx: -8 }}
					format={yTickFormat}
					ticks={[0, 90, 180, 270, 360]}
					scale={scaleY}
				/>
				<Axis
					placement="bottom"
					format={xTickFormat}
					rule
					classes={{ tickLabel: 'text-xs' }}
					tickLabelProps={{ dy: 8 }}
					ticks={4}
				/>
				<Highlight
					lines={{
						stroke: 'hsl(var(--muted-foreground))',
						strokeWidth: 1
					}}
				/>
				{#each stationNames as name}
					<Highlight
						y={(d) => d[name]}
						points={{
							fill: 'hsl(var(--background))',
							fillOpacity: 1,
							stroke: 'hsl(var(--muted-foreground)) !important',
							strokeWidth: 1,
							r: 10
						}}
					/>
				{/each}
				<defs>
					<g id="windarrow">
						<path
							d="M7.39242 13V4.22136L3.86957 7.6068L3 6.78447L8.00558 2L13 6.78447L12.1527 7.6068L8.61873 4.22136V13H7.39242Z"
						/>
					</g>
				</defs>
				{#each stationNames as name, idx}
					{#each data as item}
						{@const value = item[name] as number}
						<path
							d="M7.39242 13V4.22136L3.86957 7.6068L3 6.78447L8.00558 2L13 6.78447L12.1527 7.6068L8.61873 4.22136V13H7.39242Z"
							transform-origin="8 8"
							transform={`translate(${scaleX(item.date) - 8}, ${scaleY(value) - 8}) rotate(${value + 180})`}
							style={`fill: ${CHART_COLORS[idx]};`}
							fill={CHART_COLORS[idx]}
							color={CHART_COLORS[idx]}
						/>
					{/each}
				{/each}
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
					label: 'chart-legend-label' // Needed to offset the labels in the export
				}}
			/>
			<Tooltip.Root
				let:data
				classes={{
					...tooltipClasses,
					root: cn(tooltipClasses.root, 'w-64', 'mt-24')
				}}
				xOffset={10}
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
	{#if error}
		<div class="absolute inset-0 flex items-center justify-center">
			<ErrorAlert errorObject={error} />
		</div>
	{/if}
	<div
		class={cn(
			'absolute inset-0 flex items-center justify-center',
			'pointer-events-none opacity-0',
			isLoading && 'opacity-100'
		)}
	>
		<LoaderCircle class="size-6 animate-spin" />
	</div>
</div>
