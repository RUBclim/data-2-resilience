<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import { dayEndDate, hour, updateHour } from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import { isToday, today } from '#lib/utils/dateUtil.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import { getHours } from 'date-fns';
	import { ArrowDown, ArrowUp } from '@lucide/svelte';
	import {
		PopoverTooltip,
		PopoverTooltipContent,
		PopoverTooltipTrigger
	} from './ui/popover-tooltip';

	type ClassesType = {
		container?: string;
		input?: string;
		buttonUp?: string;
		buttonDown?: string;
		button?: string;
		icon?: string;
		iconUp?: string;
		iconDown?: string;
	};
	interface Props {
		classes?: ClassesType;
	}

	let { classes = {} }: Props = $props();
	let inputRef = $state<HTMLInputElement>();
	let upIsDisabled = $derived.by(() => {
		const dayEndIsToday = isToday($dayEndDate);
		return dayEndIsToday && $hour + 1 > getHours(today());
	});

	function parseInputValue(input: HTMLInputElement) {
		if (!input.value) return $hour;
		return parseInt(input.value.split(':')[0], 10);
	}

	function updateInputValue(val: number) {
		if (inputRef) {
			const newVal = `${`${val}`.padStart(2, '0')}:00`;
			inputRef.value = newVal;
		}
	}

	function updateHourWrapper(hour: number) {
		const h = $updateHour(hour);
		updateInputValue(h);
	}

	const onHourChange = $derived((evt: Event) => {
		evt.preventDefault();
		const target = evt.currentTarget as HTMLInputElement;
		const inputValue = parseInputValue(target);
		updateHourWrapper(inputValue);
	});

	const onHourUp = $derived((evt: MouseEvent) => {
		evt.preventDefault();
		const newHour = $hour + 1 > 23 ? 0 : $hour + 1;
		updateHourWrapper(newHour);
	});

	const onHourDown = $derived((evt: MouseEvent) => {
		evt.preventDefault();
		const newHour = $hour - 1 < 0 ? 23 : $hour - 1;
		updateHourWrapper(newHour);
	});

	const value = $derived(`${`${$hour}`.padStart(2, '0')}:00`);
</script>

<div
	class={cn(
		'relative grid grid-cols-[auto_2rem] grid-rows-2 rounded bg-background',
		'rounded border border-border',
		classes.container
	)}
>
	<input
		bind:this={inputRef}
		type="time"
		min="0"
		max="23"
		{value}
		pattern="[0-9]{2}:0{2}"
		step="3600"
		oninput={onHourChange}
		class={cn(
			'pointer-events-auto rounded border border-border',
			'bg-background px-3 py-2 text-center text-xl text-foreground',
			'row-span-2 border-none outline-hidden',
			'focus-visible:ring-2 focus-visible:ring-ring',
			'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
			'relative focus-visible:z-10 focus-visible:rounded',
			classes.input
		)}
		aria-label={$LL.generic.hourInput.inputAriaLabel()}
	/>
	<PopoverTooltip>
		<PopoverTooltipTrigger>
			<Button
				size="icon"
				variant="ghost"
				class={cn(
					'size-full rounded-none rounded-tr border-b border-l border-border',
					'relative focus-visible:z-10 focus-visible:rounded',
					classes.button,
					classes.buttonUp
				)}
				onclick={onHourUp}
				aria-label={$LL.generic.hourInput.buttonUpAriaLabel()}
				disabled={upIsDisabled}
			>
				<ArrowUp class={cn('size-4', classes.icon, classes.iconUp)} />
			</Button>
		</PopoverTooltipTrigger>
		{#if upIsDisabled}
			<PopoverTooltipContent class="max-w-40 text-sm">
				{$LL.generic.hourInput.nextHourInFuture()}
			</PopoverTooltipContent>
		{/if}
	</PopoverTooltip>

	<Button
		size="icon"
		variant="ghost"
		class={cn(
			'size-full rounded-none rounded-br border-l border-border',
			'relative focus-visible:z-10 focus-visible:rounded',
			classes.button,
			classes.buttonDown
		)}
		onclick={onHourDown}
		aria-label={$LL.generic.hourInput.buttonDownAriaLabel()}
	>
		<ArrowDown class={cn('size-4', classes.icon, classes.iconDown)} />
	</Button>
</div>

<style>
	input[type='time']::-webkit-calendar-picker-indicator {
		display: none;
	}
	input[type='time']:focus::-webkit-datetime-edit-hour-field {
		background-color: hsl(var(--primary) / 0.5);
		color: hsl(var(--foreground));
	}
	input[type='time']::-webkit-datetime-edit-text,
	input[type='time']::-webkit-datetime-edit-minute-field {
		opacity: 0.7;
		color: hsl(var(--muted-foreground));
	}
</style>
