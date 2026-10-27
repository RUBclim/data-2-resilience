<script lang="ts">
	import {
		PopoverTooltip,
		PopoverTooltipContent,
		PopoverTooltipTrigger
	} from '#lib/components/ui/popover-tooltip/index.js';
	import { cn } from '#lib/utils.js';
	import { Info } from '@lucide/svelte';

	interface Props {
		title?: string;
		description?: string;
		triggerLabel?: string;
		class?: string;
	}

	let { title = '', description = '', triggerLabel = '', class: className = '' }: Props = $props();
</script>

{#if title || description}
	<PopoverTooltip openDelay={100}>
		<PopoverTooltipTrigger
			class={cn(
				'focusable hover:bg-foreground hover:text-background',
				'group flex items-center gap-2 rounded-full p-1 transition',
				triggerLabel && '-ml-2.5 pr-1.5 pl-2.5',
				className
			)}
		>
			{#if triggerLabel}
				<span>{triggerLabel}</span>
			{/if}
			<Info
				class={cn('size-4', triggerLabel && 'text-muted-foreground group-hover:text-background')}
			></Info>
		</PopoverTooltipTrigger>
		<PopoverTooltipContent class="flex w-96 max-w-full flex-col gap-1 px-4 pt-3 pb-4 leading-tight">
			{#if title}
				<strong class="block text-base leading-5 font-semibold text-balance">{title}</strong>
			{/if}
			{#if description}
				<p class="text-sm leading-4 text-pretty text-muted-foreground">{@html description}</p>
			{/if}
		</PopoverTooltipContent>
	</PopoverTooltip>
{/if}
