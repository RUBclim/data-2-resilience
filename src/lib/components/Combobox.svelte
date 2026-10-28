<script lang="ts" generics="T">
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '#lib/components/ui/command/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { cn } from '#lib/utils.js';
	import { LL } from '#i18n/i18n-svelte.js';

	const {
		selectOptionText = $LL.generic.combobox.selectOption(),
		searchable = false,
		options,
		defaultValue = '' as T,
		onChange = () => {},
		classes = {}
	}: {
		selectOptionText?: string;
		searchable?: boolean;
		options: { value: T; label: string }[];
		defaultValue?: T;
		onChange?: (value: T) => void;
		classes?: {
			trigger?: string;
		};
	} = $props();

	const triggerId = $props.id();
	let open = $state(false);
	// svelte-ignore state_referenced_locally
	let value = $state(defaultValue);

	const selectedValue = $derived(options.find((f) => f.value === value)?.label ?? selectOptionText);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger id={triggerId}>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class={cn('w-[200px] justify-between', classes.trigger)}
			>
				{selectedValue}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			{#if searchable}
				<Command.Input placeholder={selectOptionText} />
				<Command.Empty>{$LL.generic.combobox.noResults()}</Command.Empty>
			{/if}
			<Command.Group>
				{#each options as option}
					<Command.Item
						value={`${option.value}`}
						onSelect={() => {
							value = option.value;
							onChange(value);
							closeAndFocusTrigger(triggerId);
						}}
					>
						<Check class={cn('mr-2 h-4 w-4', value !== option.value && 'text-transparent')} />
						{option.label}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
