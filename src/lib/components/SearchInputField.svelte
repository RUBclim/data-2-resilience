<script lang="ts">
	import { cn } from '$lib/utils';
	import { Search, ArrowLeftToLine } from 'lucide-svelte';
	import { Button } from './ui/button';
	import { shortcut } from '@svelte-put/shortcut';

	let {
		label,
		placeholder,
		value,
		onchange = () => {},
		classNames,
		onFocus = () => {},
		onBlur = () => {},
		onKeyDown = () => {}
	}: {
		label?: string;
		placeholder: string;
		onchange?: (newValue: string) => void;
		value: string;
		classNames?: {
			container?: string;
			label?: string;
			inputWrapper?: string;
			input?: string;
			button?: string;
		};
		onFocus?: () => void;
		onBlur?: () => void;
		onKeyDown?: (e: KeyboardEvent) => void;
	} = $props();
	let inputElement: HTMLInputElement | undefined = $state();

	let hasFocus = $state(false);

	function handleK() {
		inputElement?.focus();
	}
</script>

<svelte:window
	use:shortcut={{
		trigger: {
			key: 'k',
			modifier: ['ctrl', 'meta'],
			callback: handleK,
			preventDefault: true
		}
	}}
/>

<label
	class={cn('group flex translate-y-1 flex-col gap-1', classNames?.container)}
	id="station-table-search"
>
	{#if label && label.length > 0}
		<span class={cn('text-sm font-semibold', classNames?.label)}>{label}</span>
	{/if}
	<div class={cn('relative', classNames?.inputWrapper)}>
		<input
			type="text"
			{value}
			oninput={(evt) => {
				onchange(evt.currentTarget.value);
			}}
			bind:this={inputElement}
			onkeydown={(e) => {
				onKeyDown && onKeyDown(e);
			}}
			onfocus={() => {
				onFocus && onFocus();
				hasFocus = true;
			}}
			onblur={() => {
				onBlur && onBlur();
				hasFocus = false;
			}}
			{placeholder}
			class={cn(
				'py-2 pl-3 pr-12 text-base placeholder-muted-foreground',
				'w-64 max-w-full rounded border border-border bg-background',
				'focusable focus-visible:border-muted-foreground',
				classNames?.input
			)}
		/>
		<Button
			size="icon"
			variant="ghost"
			on:click={() => {
				if (value.length === 0) {
					inputElement?.focus();
				} else {
					onchange('');
				}
			}}
			class={cn(
				'absolute right-px top-1/2 h-[calc(100%-2px)] -translate-y-1/2',
				'rounded-none rounded-r-sm focus-visible:rounded',
				'border-l border-muted',
				classNames?.button
			)}
		>
			{#if value.length === 0}
				<Search class="size-5" />
			{:else}
				<ArrowLeftToLine class="size-5" />
			{/if}
		</Button>
		<span
			aria-hidden="true"
			class={cn(
				'absolute right-12 top-1/2 -translate-y-1/2 px-1',
				'inline-flex items-center gap-0.5 text-muted-foreground',
				'transition-opacity',
				hasFocus || value.length > 0 ? 'opacity-0' : 'opacity-100'
			)}
		>
			<kbd class="text-xl">⌘</kbd>
			<kbd class="scale-[85%] text-lg">K</kbd>
		</span>
	</div>
</label>
