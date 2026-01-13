<script lang="ts">
	import { page } from '$app/state';
	import { LL, locale } from '$i18n/i18n-svelte';
	import type { TranslationFunctions } from '$i18n/i18n-types';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import {
		PopoverTooltip,
		PopoverTooltipContent,
		PopoverTooltipTrigger
	} from '$lib/components/ui/popover-tooltip';
	import type { StationsGeoJSONType } from '$lib/stores/mapData';
	import { dayValue, heatStressUnit, hour, isLeftSidebarOpened, unit } from '$lib/stores/uiStore';
	import { cn } from '$lib/utils';
	import { api } from '$lib/utils/api';
	import { getColorsByUnit, getColorStops, unitsToScalesMap } from '$lib/utils/colorScaleUtil';
	import { today } from '$lib/utils/dateUtil';
	import { getHealthRisksByUnit, isHealthRiskUnit } from '$lib/utils/healthRisksUtil';
	import { reactiveQueryArgs } from '$lib/utils/queryUtils.svelte';
	import { useStationsSnapshotConfig } from '$lib/utils/useStationsSnapshot';
	import { createQuery, type QueryKey, type QueryOptions } from '@tanstack/svelte-query';
	import { scaleLinear } from 'd3-scale';
	import {
		addDays,
		addHours,
		format,
		getDayOfYear,
		getHours,
		getYear,
		setHours,
		setYear,
		startOfYear
	} from 'date-fns';
	import { HeartPulse, X } from 'lucide-svelte';
	import HealthRiskPill from './HealthRiskPill.svelte';
	import { PUBLIC_ENABLE_HEATATLAS_TIMESLIDER } from '$env/static/public';

	// Props
	interface Props {
		stations: StationsGeoJSONType;
		initialStationIds?: string[];
	}
	const { stations, initialStationIds = [] }: Props = $props();

	// Local state
	let open = $state(false);

	// Page reactive variables
	const p = $derived(page.url.pathname.replace(`/${$locale}`, '').replaceAll('/', ''));
	const currentPage = $derived(p === '' ? 'measurements' : p);
	const isAboutPage = $derived(currentPage === 'about');
	const isHeatStressPage = $derived(currentPage.trim().toLowerCase() === 'heat-stress');
	const isMeasurmentPage = $derived(currentPage.trim().toLowerCase() === 'measurements');

	// Unit related variables
	type Unit = keyof TranslationFunctions['pages']['measurements']['unitSelect']['units'];
	const getUnitLabelsByUnit = $derived(function (unit: Unit, isCategoryUnit = false) {
		return {
			unitOnlyLabel:
				$LL.pages.measurements.unitSelect.units[
					isCategoryUnit ? (unit.replace('_category', '') as Unit) : unit
				].unitOnly(),
			label: $LL.pages.measurements.unitSelect.units[unit].label(),
			description: $LL.pages.measurements.unitSelect.units[unit].description()
		};
	});
	const pageUnit = $derived(isMeasurmentPage ? ($unit as Unit) : ($heatStressUnit as Unit));
	const isOrdinalUnit = $derived(pageUnit.endsWith('_category'));
	const labels = $derived(getUnitLabelsByUnit(pageUnit, isOrdinalUnit));
	const isHealthUnit = $derived(isHealthRiskUnit(pageUnit));
	const healthRisks = $derived(getHealthRisksByUnit({ unit: pageUnit, LL: $LL }));
	const scheme = $derived(getColorsByUnit({ unit: pageUnit, LL: $LL }));

	const stationsSnapshotQueryConfig = $derived.by(() =>
		useStationsSnapshotConfig({ initialStationIds, stations })
	);
	const snapshotQuery = createQuery(reactiveQueryArgs(() => $stationsSnapshotQueryConfig));

	const scaleMin = $derived($snapshotQuery.data?.scaleMin ?? 0);
	const scaleMax = $derived($snapshotQuery.data?.scaleMax ?? 100);

	let customGradient = $derived.by(() => {
		const stops = getColorStops({
			unit: $unit,
			LL: $LL,
			min: scaleMin ?? null,
			max: scaleMax ?? null
		});
		if (stops.length === 0) return '';
		const allStops = stops.map(({ color, position }) => `${color} ${position.toFixed(2)}%`);
		return `linear-gradient(to right, ${allStops})`;
	});

	const showLeftSidebar = $derived(!isAboutPage && $isLeftSidebarOpened);
	const isWindDirectionUnit = $derived(pageUnit.startsWith('wind_direction'));

	const showTimeslider = PUBLIC_ENABLE_HEATATLAS_TIMESLIDER === 'true';
	const queryKey = $derived(['lastAvailableRasterLayer', $heatStressUnit, getYear(today())]);
	const lastAvailableRasterLayerQuery = createQuery(
		reactiveQueryArgs(() => ({
			queryKey,
			queryFn: async ({ queryKey }: QueryOptions<QueryKey>) => {
				const [, param, year] = queryKey as [string, string, number];
				return api().getLatestRasterData({ year, param });
			},
			enabled: !showTimeslider,
			staleTime: Infinity,
			cacheTime: Infinity
		}))
	);
	const finalLocalDate = $derived.by(() => {
		// When timeslider is enabled, use the timeslider values
		if (showTimeslider) {
			const sliderDate = addDays(today(), $dayValue);
			// $hour is in LOCAL time, set it as local hour
			const localDate = setHours(sliderDate, $hour);
			// Return the date as-is - it represents the local time which will be interpreted as UTC by the API
			return localDate;
		}

		// When timeslider is disabled, use API data
		const config = {
			doy: $lastAvailableRasterLayerQuery.data?.doy ?? getDayOfYear(today()),
			hour:
				$lastAvailableRasterLayerQuery.data?.hour ??
				getHours(addHours($hour, today().getTimezoneOffset() / 60)),
			year: $lastAvailableRasterLayerQuery.data?.year ?? getYear(today()),
			param: $heatStressUnit.toUpperCase()
		};
		const yearStart = startOfYear(setYear(today(), config.year));
		const startOfDay = addDays(yearStart, config.doy - 1);
		const tzOffsetInHours = startOfDay.getTimezoneOffset() / 60;
		const date = addHours(setHours(startOfDay, config.hour), -tzOffsetInHours);
		return date;
	});
	const dateKey = $derived(format(finalLocalDate, 'yyyy-MM-dd-HH'));
	const heatStressGradientquery = createQuery(
		reactiveQueryArgs(() => ({
			queryKey: ['heatStressGradient', dateKey, $heatStressUnit],
			queryFn: async () => {
				const metadata = await api().getHeatStressMetadata({
					date: finalLocalDate,
					unit: $heatStressUnit
				});
				let cmap = 'turbo';
				if ($heatStressUnit === 'relative_humidity') {
					cmap = 'ylgnbu';
				} else if ($heatStressUnit === 'air_temperature') {
					cmap = 'spectral_r';
				}
				let colormap = await api().getHeatStressColormap({
					rangeStart: metadata?.range[0] || 0,
					rangeEnd: metadata?.range[1] || 100,
					cmap: cmap,
				});
				if (!colormap)
					return {
						colormap: [],
						metadata
					};
				const colormapScale = scaleLinear()
					.domain([
						Math.min(...colormap.map(({ value }) => value)),
						Math.max(...colormap.map(({ value }) => value))
					])
					.range([0, 100]);
				return {
					colormap: [...new Set(colormap)].map(({ value, rgba }) => ({
						value: colormapScale(value),
						rgb: [rgba[0], rgba[1], rgba[2]]
					})),
					metadata
				};
			},
			enabled: isHeatStressPage && (showTimeslider || $lastAvailableRasterLayerQuery.isSuccess),
			staleTime: Infinity,
			cacheTime: Infinity
		}))
	);

	const heatStressGradient = $derived.by(() => {
		if (!isHeatStressPage || !$heatStressGradientquery.data?.colormap.length) return null;
		const stops = $heatStressGradientquery.data.colormap.map(
			({ value, rgb }) => `rgb(${rgb.join(', ')}) ${value}%`
		);
		return `linear-gradient(to right, ${stops.join(', ')})`;
	});

	const formatValue = $derived((val: number) => {
		return `${Math.round(val).toLocaleString($locale)} ${labels.unitOnlyLabel}`;
	});
	const minLabel = $derived.by(() => {
		if ($heatStressGradientquery.isLoading || $snapshotQuery.isLoading) return '...';
		if (isHeatStressPage) {
			const min = $heatStressGradientquery.data?.metadata?.range[0];
			return min ? formatValue(min) : '';
		}
		return !isOrdinalUnit && typeof scaleMin === 'number' ? formatValue(scaleMin) : '';
	});
	const maxLabel = $derived.by(() => {
		if ($heatStressGradientquery.isLoading && isHeatStressPage) return '...';
		if ($snapshotQuery.isLoading && !isHeatStressPage) return '...';
		if (isHeatStressPage) {
			const max = $heatStressGradientquery.data?.metadata?.range[1];
			return max ? formatValue(max) : '';
		}
		return !isOrdinalUnit && typeof scaleMax === 'number' ? formatValue(scaleMax) : '';
	});
</script>

<div
	class={cn(
		'flex w-72 flex-col gap-2 bg-background/80 text-sm backdrop-blur-[2px]',
		'fixed bottom-4 left-4 z-10 overflow-clip rounded border border-border shadow-lg dark:shadow-black/80',
		showLeftSidebar
			? 'opacity-0 sm:translate-x-[var(--leftSidebarWidth)] sm:opacity-100'
			: 'translate-x-0',
		'p-4 transition duration-300 ease-in-out',
		'[&:has(input:focus-visible)]:ring-2 [&:has(input:focus-visible)]:ring-ring',
		'[&:has(input:focus-visible)]:ring-offset-2 [&:has(input:focus-visible)]:ring-offset-background'
	)}
>
	<strong>{labels.label}</strong>
	{#if !isWindDirectionUnit}
		<div class="flex flex-col gap-0">
			{#if isOrdinalUnit}
				<div
					class="group flex h-4 w-full max-w-96 overflow-clip rounded-sm shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
				>
					{#each scheme as color, i}
						<PopoverTooltip openDelay={0} closeDelay={0} disableHoverableContent>
							<PopoverTooltipTrigger
								class={cn(
									'focusable size-full',
									'transition-opacity hover-hover:group-has-[button:hover]:opacity-20 hover-hover:group-has-[button:hover]:hover:opacity-100'
								)}
								style={`background-color: ${color}`}
							/>
							<PopoverTooltipContent
								class={cn('flex w-96 max-w-full flex-col gap-1 px-4 pb-4 pt-3 leading-tight')}
							>
								{#if healthRisks[i]}
									<strong class="flex gap-2 font-semibold">
										<span>{healthRisks[i].title}</span>
										{#if healthRisks[i].ranges}
											<span class="whitespace-nowrap font-normal text-muted-foreground">
												({healthRisks[i].ranges})
											</span>
										{/if}
									</strong>
									<span>{@html healthRisks[i].description}</span>
								{/if}
							</PopoverTooltipContent>
						</PopoverTooltip>
					{/each}
				</div>
			{:else}
				<div
					class="h-4 w-full max-w-96 rounded-sm bg-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
					style={cn(
						isHeatStressPage &&
							!$heatStressGradientquery.isLoading &&
							!isOrdinalUnit &&
							`background-image: ${heatStressGradient};`,
						!isHeatStressPage &&
							!$snapshotQuery.isLoading &&
							!isOrdinalUnit &&
							`background-image: ${customGradient};`,
						($heatStressGradientquery.isLoading || $snapshotQuery.isLoading || isOrdinalUnit) &&
							'animate-pulse'
					)}
				></div>
			{/if}
			<div
				class={cn(
					'flex w-full items-center justify-between pt-1 text-xs leading-4 text-muted-foreground',
					$heatStressGradientquery.isLoading && !isOrdinalUnit && 'animate-pulse'
				)}
			>
				<span
					class={cn(
						$heatStressGradientquery.isLoading && !isOrdinalUnit && '-translate-y-1/3 animate-pulse'
					)}
				>
					{isOrdinalUnit ? healthRisks[0].title : minLabel}
				</span>
				<span
					class={cn(
						$heatStressGradientquery.isLoading &&
							!isOrdinalUnit &&
							'-translate-y-1/3 animate-pulse',
						'text-right'
					)}
				>
					{isOrdinalUnit ? healthRisks[healthRisks.length - 1].title : maxLabel}
				</span>
			</div>
		</div>
	{/if}
	{#if isMeasurmentPage}
		<div class="flex flex-col">
			{#if isWindDirectionUnit}
				<span class="inline-grid grid-cols-[0.75rem_1fr] items-center gap-2">
					<HealthRiskPill value={123} withLabel {stations} {initialStationIds} />
				</span>
			{/if}
			<span class="inline-grid grid-cols-[0.75rem_1fr] items-center gap-2">
				<HealthRiskPill value={undefined} withLabel {stations} {initialStationIds} />
			</span>
			<span class="mb-1 inline-grid grid-cols-[0.75rem_1fr] items-center gap-2">
				<HealthRiskPill value={null} withLabel {stations} {initialStationIds} />
			</span>
		</div>
	{/if}
	{#if isHealthUnit}
		<Popover.Root bind:open>
			<Popover.Trigger asChild>
				{#snippet children({ builder })}
					<Button
						builders={[builder]}
						variant="link"
						role="combobox"
						aria-expanded={open}
						class={cn('flex h-fit items-center justify-start gap-2 p-0 transition-all')}
					>
						<HeartPulse class="size-5 shrink-0 text-pink-700" />
						<span
							>{open
								? $LL.map.choroplethLegend.hideHealthRisks()
								: $LL.map.choroplethLegend.showHealthRisks()}</span
						>
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content
				class="max-h-[calc(100vh-20rem)] w-72 -translate-y-[7.5rem] overflow-y-auto rounded p-0 pb-2"
			>
				<strong
					class={cn(
						'grid grid-cols-[1.25rem_1fr_1.25rem] items-center gap-2 text-base font-semibold',
						'sticky top-0 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-[2px]'
					)}
				>
					<HeartPulse class="size-5 text-pink-700" />
					<span>{$LL.map.choroplethLegend.title()}</span>
					<Button variant="ghost" size="icon" class="size-5 p-0" on:click={() => (open = false)}>
						<X class="size-5 text-muted-foreground" />
					</Button>
				</strong>
				<ul class="flex flex-col p-4 text-sm">
					{#each healthRisks.toReversed() as { title, description, ranges }, i}
						<li
							class={cn('border-b border-l-4 py-2 pl-4 last-of-type:border-b-0')}
							style={`border-left-color: ${unitsToScalesMap.utci_category.scheme.toReversed()[i]}`}
						>
							<p>
								<strong>{title}</strong>
								<span class="whitespace-nowrap text-muted-foreground">({ranges})</span>{': '}
							</p>
							{@html description}
						</li>
					{/each}
				</ul>
			</Popover.Content>
		</Popover.Root>
	{/if}
</div>
