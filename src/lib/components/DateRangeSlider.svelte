<script lang="ts">
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import {
		datavisType,
		dayValue,
		rangeEnd,
		rangeStart,
		udpateDatavisType,
		udpateDay,
		udpateRangeStart,
		updateRangeEnd
	} from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import { isToday, today } from '#lib/utils/dateUtil.js';
	import { addDays } from 'date-fns';
	import { RangeSlider } from 'svelte-range-slider-pips';
	import HourInput from './HourInput.svelte';
	import InfoTooltip from './InfoTooltip.svelte';
	import Button from './ui/button/button.svelte';

	const dateRangeStart = -30;
	const dateRangeEnd = 0;

	let formatter = $derived((value: number) => {
		if (Number.isNaN(value)) return '';
		const date = addDays(today(), Object.is(value, -0) ? 0 : value);
		if (isToday(date)) return $LL.pages.measurements.dateRangeSlider.today();
		return new Intl.DateTimeFormat($locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(date);
	});

	const onRangeChange = (event: CustomEvent<{ values: [number, number] }>) => {
		const [startV, endV] = event.detail.values;
		if (typeof startV !== 'number' || typeof endV !== 'number') return;
		if (Number.isNaN(startV) || Number.isNaN(endV)) return;
		udpateRangeStart(startV);
		updateRangeEnd(endV);
	};

	const onValueChange = (event: CustomEvent<{ value: number }>) => {
		const value = event.detail.value;
		if (typeof value !== 'number' || Number.isNaN(value)) return;
		udpateDay(Math.round(value));
	};

	const commonProps = {
		min: dateRangeStart,
		max: dateRangeEnd,
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
</script>

<div class={cn('date-range-slider flex flex-col gap-2')}>
	{#if $datavisType === 'range'}
		<RangeSlider
			values={[$rangeStart, $rangeEnd]}
			on:change={onRangeChange}
			range
			{...commonProps}
			{formatter}
			first="label"
		/>
	{:else}
		<div class="grid grid-cols-[1fr_auto] gap-2">
			<div class="pt-2">
				<RangeSlider
					value={$dayValue}
					on:change={onValueChange}
					range={false}
					{...commonProps}
					{formatter}
				/>
			</div>
			{#if $datavisType === 'hour'}
				<div class="flex flex-col gap-1">
					<span class="text-xs font-semibold">{$LL.generic.hourInput.label()}</span>
					<HourInput />
				</div>
			{/if}
		</div>
	{/if}
	<div class="flex justify-center max-xs:flex-col">
		<Button
			variant={$datavisType === 'hour' ? 'default' : 'outline'}
			size="sm"
			onclick={() => udpateDatavisType('hour')}
			class="rounded-r-none focus-visible:z-10 focus-visible:rounded"
		>
			{$LL.pages.measurements.dateRangeSlider.hour()}
		</Button>
		<Button
			variant={$datavisType === 'day' ? 'default' : 'outline'}
			size="sm"
			onclick={() => udpateDatavisType('day')}
			class="-ml-px rounded-none focus-visible:z-10 focus-visible:rounded"
		>
			{$LL.pages.measurements.dateRangeSlider.day()}
		</Button>
		<Button
			variant={$datavisType === 'range' ? 'default' : 'outline'}
			size="sm"
			onclick={() => udpateDatavisType('range')}
			class="-ml-px rounded-l-none focus-visible:z-10 focus-visible:rounded"
		>
			{$LL.pages.measurements.dateRangeSlider.range()}
		</Button>
		<span class="flex items-center justify-center pl-2 max-xs:pt-3 sm:aspect-square">
			<InfoTooltip
				title={$LL.pages.measurements.dateRangeSlider.infoTitle()}
				description={$LL.pages.measurements.dateRangeSlider.infoDescription()}
			/>
		</span>
	</div>
</div>

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

	:global(.date-range-slider .rangePips .rsPip--first > .rsPipVal) {
		transform: translate(0, 25%);
	}

	:global(.date-range-slider .rangePips .rsPip--last > .rsPipVal) {
		transform: translate(-100%, 25%);
	}

	:global(.date-range-slider .rangePips .rsPip.rsSelected .rsPipVal) {
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
