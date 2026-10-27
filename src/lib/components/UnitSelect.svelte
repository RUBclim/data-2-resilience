<script lang="ts">
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Command from '#lib/components/ui/command/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { unit, updateUnit } from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import { sortUnitByLabel } from '#lib/utils/textUtil.js';
	import { Check, ChevronDown } from '@lucide/svelte';
	import { tick } from 'svelte';
	import type { ChangeEventHandler } from 'svelte/elements';
	import CollapsibleParagraph from './CollapsibleParagraph.svelte';
	import {
		PopoverTooltip,
		PopoverTooltipContent,
		PopoverTooltipTrigger
	} from './ui/popover-tooltip';

	let searchValue = $state('');
	const units = $derived(
		Object.entries($LL.pages.measurements.unitSelect.units)
			.filter(([key]) => !(key.endsWith('_min') || key.endsWith('_max')))
			.map(([key, value]) => ({
				value: key,
				label: value.label(),
				unitOnly: value.unitOnly(),
				description: value.description()
			}))
			.filter(
				({ label, value }) =>
					label.toLowerCase().includes(searchValue.toLowerCase()) ||
					value.toLowerCase().includes(searchValue.toLowerCase())
			)
			.sort((a, b) => sortUnitByLabel(a, b, $locale))
	);

	const triggerId = $props.id();
	let open = $state(false);

	let selectedValue = $derived(units.find((f) => f.value === $unit));
	let selectedValueLabel = $derived(
		selectedValue?.label ?? $LL.pages.measurements.unitSelect.placeholder()
	);
	let selectedValueDescription = $derived(
		selectedValue?.value
			? $LL.pages.measurements.unitSelect.units[
					selectedValue.value as keyof typeof $LL.pages.measurements.unitSelect.units
				]?.description()
			: ''
	);

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		searchValue = '';
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	const handleSearch: ChangeEventHandler<HTMLInputElement> = (evt) => {
		evt.preventDefault();
		const value = evt.currentTarget.value;
		searchValue = value;
	};
</script>

<div class="scroll-mt-20" id="unit-select">
	<Popover.Root bind:open>
		<Popover.Trigger id={triggerId}>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					class={cn(
						'grid h-fit w-[calc(var(--leftSidebarWidth)-3rem)] grid-cols-[1fr_auto]',
						'items-center px-3 py-2.5 text-left'
					)}
				>
					<span class="truncate">{selectedValueLabel}</span>
					<ChevronDown
						class={cn(
							'ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform',
							open && 'rotate-180'
						)}
					/>
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-[calc(var(--leftSidebarWidth)-3rem)] -translate-y-px p-0">
			<Command.Root shouldFilter={false}>
				<Command.Input
					placeholder={$LL.pages.measurements.unitSelect.searchPlaceholder()}
					oninput={handleSearch}
					class="h-9"
				/>
				{#if !units.length}
					<Command.Empty>{$LL.pages.measurements.unitSelect.noUnitFound()}</Command.Empty>
				{:else}
					<Command.Group>
						{#each units as { value, label, unitOnly, description } (value)}
							<Command.Item
								{value}
								onSelect={() => {
									updateUnit(value);
									closeAndFocusTrigger(triggerId);
									searchValue = '';
								}}
							>
								<PopoverTooltip disableHoverableContent openDelay={0} closeDelay={0}>
									<PopoverTooltipTrigger class="flex w-fit gap-1 text-left">
										<Check
											class={cn('mr-1 h-4 w-4 shrink-0', $unit !== value && 'text-transparent')}
										/>
										<span>{label}</span>
										{#if unitOnly}
											<span class="text-muted-foreground"> ({unitOnly})</span>
										{/if}
									</PopoverTooltipTrigger>
									<PopoverTooltipContent side="right" strategy="fixed" class="w-80 max-w-full">
										{@html description}
									</PopoverTooltipContent>
								</PopoverTooltip>
							</Command.Item>
						{/each}
					</Command.Group>
				{/if}
			</Command.Root>
		</Popover.Content>
	</Popover.Root>

	{#if selectedValue}
		<CollapsibleParagraph className="mt-2" linesClampedCount={3}>
			<p>{@html selectedValueDescription}</p>
		</CollapsibleParagraph>
	{/if}
</div>
