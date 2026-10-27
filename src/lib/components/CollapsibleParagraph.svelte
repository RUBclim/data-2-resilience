<script lang="ts">
	import LL from '#i18n/i18n-svelte.js';
	import { cn } from '#lib/utils.js';
	import { type Snippet } from 'svelte';
	import { Button } from './ui/button';

	const clampingClasses = {
		1: 'line-clamp-1',
		2: 'line-clamp-2',
		3: 'line-clamp-3',
		4: 'line-clamp-4',
		5: 'line-clamp-5'
	};

	type Props = {
		defaultIsExpanded?: boolean;
		className?: string;
		linesClampedCount?: keyof typeof clampingClasses;
		children?: Snippet<[]>;
	};

	const { children, defaultIsExpanded, className, linesClampedCount }: Props = $props();

	// svelte-ignore state_referenced_locally
	let isExpanded = $state(defaultIsExpanded ?? false);
	let isExpandable = $state(true);
	let contentDiv: HTMLDivElement | null = $state(null);
	let shadowDiv: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (!contentDiv) return;

		const checkIfExpandable = () => {
			if (!contentDiv || !shadowDiv) return;

			shadowDiv.innerHTML = '';
			shadowDiv.classList.add(clampingClasses[linesClampedCount ?? 2]);
			shadowDiv.innerHTML = contentDiv.innerHTML;

			setTimeout(() => {
				if (!shadowDiv) return;
				isExpandable = shadowDiv.scrollHeight > shadowDiv.clientHeight;
				shadowDiv.innerHTML = '';
			}, 0);
		};

		checkIfExpandable();

		const observer = new MutationObserver(checkIfExpandable);

		observer.observe(contentDiv, {
			childList: true,
			subtree: true,
			characterData: true
		});

		return () => observer.disconnect();
	});

	function toggle() {
		isExpanded = !isExpanded;
	}
</script>

<div
	bind:this={contentDiv}
	class={cn(
		'flex flex-col gap-1 transition-colors',
		!isExpanded && clampingClasses[linesClampedCount ?? 2],
		!isExpanded && isExpandable && 'text-muted-foreground',
		className
	)}
>
	{@render children?.()}
</div>

<div bind:this={shadowDiv}></div>

{#if isExpandable}
	<Button
		variant="link"
		type="button"
		size="sm"
		onclick={toggle}
		class={cn(
			'mt-1 -ml-3 h-fit text-sm font-semibold transition-opacity',
			!isExpanded && 'opacity-90'
		)}
	>
		{isExpanded ? $LL.generic.collapse() : $LL.generic.expand()}
	</Button>
{/if}
