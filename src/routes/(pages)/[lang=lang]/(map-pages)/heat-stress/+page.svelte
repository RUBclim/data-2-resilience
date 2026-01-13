<script lang="ts">
	import { PUBLIC_ENABLE_HEATATLAS_TIMESLIDER } from '$env/static/public';
	import { LL, locale } from '$i18n/i18n-svelte';
	import { dayValue, heatStressUnit, hour, udpateDay } from '$lib/stores/uiStore';
	import { cn } from '$lib/utils';
	import { api } from '$lib/utils/api';
	import { isToday, today } from '$lib/utils/dateUtil';
	import { reactiveQueryArgs } from '$lib/utils/queryUtils.svelte';
	import { createQuery, type QueryKey, type QueryOptions } from '@tanstack/svelte-query';
	import CollapsibleParagraph from 'components/CollapsibleParagraph.svelte';
	import HourInput from 'components/HourInput.svelte';
	import InfoTooltip from 'components/InfoTooltip.svelte';
	import ThermalCompfortNavItem from 'components/ThermalCompfortNavItem.svelte';
	import { Alert, AlertDescription, AlertTitle } from 'components/ui/alert';
	import {
		addDays,
		addHours,
		differenceInCalendarDays,
		differenceInHours,
		getDayOfYear,
		getHours,
		getYear,
		setHours,
		setYear,
		startOfYear
	} from 'date-fns';
	import RangeSlider from 'svelte-range-slider-pips';

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
	const finalDateDistHours = $derived(
		Math.abs(Math.ceil(differenceInHours(finalLocalDate, today())))
	);
	const finalDateDistDays = $derived(
		Math.abs(Math.ceil(differenceInCalendarDays(finalLocalDate, today())))
	);

	let indicatorValues = $derived([
		{
			slug: 'utci' as const,
			title: $LL.indicators.utci.title(),
			description: $LL.indicators.utci.description(),
			hasCategory: true,
			isSelected: $heatStressUnit === 'utci_category' || $heatStressUnit === 'utci'
		},
		{
			slug: 'relative_humidity' as const,
			title: $LL.indicators.relative_humidity.title(),
			description: $LL.indicators.relative_humidity.description(),
			hasCategory: false,
			isSelected: $heatStressUnit === 'relative_humidity'
		},
		{
			slug: 'air_temperature' as const,
			title: $LL.indicators.air_temperature.title(),
			description: $LL.indicators.air_temperature.description(),
			hasCategory: false,
			isSelected: $heatStressUnit === 'air_temperature'
		}
	]);

	let formatter = $derived((value: number) => {
		if (Number.isNaN(value)) return '';
		const date = addDays(today(), value === -0 ? 0 : value);
		if (isToday(date)) return $LL.pages.measurements.dateRangeSlider.today();
		return new Intl.DateTimeFormat($locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(date);
	});

	const rangeSliderProps = {
		min: -30,
		max: 0,
		step: 1,
		pushy: true,
		float: true,
		pips: true,
		first: 'label' as const,
		last: 'label' as const,
		springValues: {
			stiffness: 0.3,
			damping: 0.6
		}
	};

	const onValueChange = (event: CustomEvent<{ value: number }>) => {
		const value = event.detail.value;
		if (typeof value !== 'number' || Number.isNaN(value)) return;
		udpateDay(Math.round(value));
	};

	const singleDateAlertVariant = $derived.by(() => {
		if (finalDateDistHours < 2) {
			return 'default' as const;
		} else if (finalDateDistHours > 24) {
			return 'destructive' as const;
		}
		return 'warning' as const;
	});
</script>

<h1 class="mb-2 text-xl font-semibold">{$LL.pages.heatStress.title()}</h1>
<CollapsibleParagraph>
	{#each Object.values($LL.pages.heatStress.intro) as paragraph}
		<p>{paragraph()}</p>
	{/each}
</CollapsibleParagraph>

<nav
	aria-label={$LL.pages.heatStress.indicatorsNavAriaLabel()}
	id="heat-stress-selector"
	class="mt-6"
>
	<ul
		class={cn(
			'flex flex-col gap-px rounded-t-xl border border-border bg-border',
			showTimeslider ? 'rounded-b-none' : 'rounded-b-xl'
		)}
	>
		{#each indicatorValues as indicator (indicator.slug)}
			<ThermalCompfortNavItem {indicator} />
		{/each}
	</ul>
</nav>

{#if showTimeslider}
	<div class={cn('date-range-slider flex flex-col gap-2', 'rounded-b-xl border border-border p-4')}>
		<div class={cn('grid grid-cols-[1fr_auto] gap-2')}>
			<div class={cn('pt-2 [&_.rangeSlider]:ml-0')} id="date-range-slider">
				<RangeSlider
					value={$dayValue}
					on:change={onValueChange}
					range={false}
					{...rangeSliderProps}
					{formatter}
				/>
			</div>
			<div class={cn('flex flex-col gap-1')}>
				<span class="text-xs font-semibold">{$LL.generic.hourInput.label()}</span>
				<HourInput />
			</div>
		</div>
	</div>
{/if}

{#if showTimeslider}
	<div
		class={cn(
			'rounded bg-muted px-4 pb-2 pt-1.5 text-sm font-semibold',
			'mt-4 grid grid-cols-[1fr,auto] items-center gap-2'
		)}
		role="alert"
	>
		<span class="text-balance">
			{$LL.pages.heatStress.timeRangeAlert({
				startDate: new Date('2024-07-01').toLocaleDateString($locale, {
					day: '2-digit',
					month: 'long',
					year: undefined
				}),
				endDate: new Date('2024-07-31').toLocaleDateString($locale, {
					day: '2-digit',
					month: 'long',
					year: 'numeric'
				})
			})}
		</span>
		<InfoTooltip
			title={$LL.pages.heatStress.timeRangeAlertTooltipTitle()}
			description={$LL.pages.heatStress.timeRangeAlertTooltipContent()}
		/>
	</div>
{:else if finalLocalDate && $lastAvailableRasterLayerQuery.isSuccess}
	<Alert
		variant={singleDateAlertVariant}
		class={cn('mt-4', singleDateAlertVariant === 'default' && 'bg-muted')}
	>
		<AlertTitle>
			{$LL.pages.heatStress.singleDateAlertTitle({
				date: new Date(finalLocalDate).toLocaleDateString($locale, {
					day: 'numeric',
					month: 'long',
					hour: '2-digit'
				})
			})}
			{#if finalDateDistHours > 2 && finalDateDistHours < 24}
				{$LL.pages.heatStress.singleDateAlertTitleHoursAgo({
					dist: finalDateDistHours.toLocaleString($locale, {
						maximumFractionDigits: 0,
						minimumFractionDigits: 0
					})
				})}
			{:else if finalDateDistHours > 24}
				{$LL.pages.heatStress.singleDateAlertTitleDaysAgo({
					dist: finalDateDistDays.toLocaleString($locale, {
						maximumFractionDigits: 0
					})
				})}
			{/if}
		</AlertTitle>
		<AlertDescription>
			{@html $LL.pages.heatStress.singleDateAlertDescription()}
			{#if finalDateDistHours <= 2}
				{$LL.pages.heatStress.singleDateAlertDescriptionActualData()}
			{:else if finalDateDistHours > 2 && finalDateDistHours < 24}
				{$LL.pages.heatStress.singleDateAlertDescriptionOldDataHours({
					dist: finalDateDistHours.toLocaleString($locale, {
						maximumFractionDigits: 0,
						minimumFractionDigits: 0
					})
				})}
			{:else if finalDateDistHours > 24}
				{$LL.pages.heatStress.singleDateAlertDescriptionOldDataDays({
					dist: finalDateDistDays.toLocaleString($locale, {
						maximumFractionDigits: 0
					})
				})}
			{/if}
		</AlertDescription>
	</Alert>
{/if}

<style>
	:global(.date-range-slider) {
		--range-slider: hsl(var(--muted-foreground) / 0.3);
		--range-handle-inactive: hsl(var(--primary));
		--range-handle: hsl(var(--primary));
		--range-handle-focus: hsl(var(--primary));
		--range-handle-border: hsl(var(--muted-primary));
		--range-range-inactive: hsl(var(--primary));
		--range-range: hsl(var(--primary));
		--range-float-inactive: hsl(var(--primary));
		--range-float: hsl(var(--primary));
		--range-float-text: hsl(var(--primary-foreground));

		--range-pip: hsl(var(--muted-foreground) / 0.3);
		--range-pip-text: hsl(var(--muted-foreground));
		--range-pip-active: hsl(var(--muted-foreground));
		--range-pip-active-text: hsl(var(--primary-foreground));
		--range-pip-hover: hsl(var(--primary));
		--range-pip-hover-text: hsl(var(--primary-foreground));
		--range-pip-in-range: hsl(var(--muted-foreground));
		--range-pip-in-range-text: hsl(var(--muted-foreground));
	}

	:global(.date-range-slider .rangePips .pip.first > .pipVal) {
		transform: translate(0, 25%);
	}

	:global(.date-range-slider .rangePips .pip.last > .pipVal) {
		transform: translate(-100%, 25%);
	}

	:global(.date-range-slider .rangePips .pip.selected .pipVal) {
		top: 0.4em;
	}

	:global(.date-range-slider .rangeSlider .rangeHandle:focus-visible) {
		outline: none;
		border-radius: 999px;
		box-shadow:
			0 0 0 4px hsl(var(--background)),
			0 0 0 6px hsl(var(--ring));
	}
</style>
