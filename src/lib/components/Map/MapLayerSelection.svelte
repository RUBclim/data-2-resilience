<script lang="ts">
	import { page } from '$app/state';
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import {
		boundariesMode,
		isLeftSidebarOpened,
		showSatellite,
		showBuildings,
		showStreets,
		updateBoundariesMode,
		updateShowSatellite,
		updateShowBuildings,
		updateShowStreets
	} from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import CheckboxIcon from '#lib/components/CheckboxIcon.svelte';
	import InfoTooltip from '#lib/components/InfoTooltip.svelte';
	import Button from '#lib/components/ui/button/button.svelte';
	import { Layers3 } from '@lucide/svelte';

	const isAboutPage = $derived(page.url.pathname.startsWith(`/${$locale}/about`));
	const showLeftSidebar = $derived(!isAboutPage && $isLeftSidebarOpened);

	let menuContent = $state<HTMLElement | null>(null);

	// the first tabbable element of the menu is the info button of its first item: focusing it on
	// open showed its tooltip under the pointer, which caught the end of the opening click and so
	// toggled the city districts. Focus the menu itself, as bits-ui does for menus without nested
	// buttons (keyboard users still land on the first item).
	function focusMenu(e: Event) {
		e.preventDefault();
		menuContent?.focus({ preventScroll: true });
	}
</script>

<DropdownMenu.Root>
	<!-- bits-ui 0.x dropped the aria-label of asChild triggers: bits-ui 2 would render it and change the
	accessible name (KNOWN BUG in the e2e tests), so it stays off for now -->
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="ghost"
				size="icon"
				class={cn(
					'fixed top-[calc(var(--headerHeight,5rem)+6rem)] right-4 z-50 flex flex-col gap-px',
					'rounded-md border border-border bg-border',
					'shadow-lg transition duration-300 ease-in-out dark:shadow-black/80',
					'size-10 bg-background',
					'focusable focus-visible:z-50 focus-visible:rounded',
					showLeftSidebar && 'max-sm:pointer-events-none max-sm:opacity-0'
				)}
			>
				<Layers3 class="size-5" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content bind:ref={menuContent} onOpenAutoFocus={focusMenu} align="end" class="w-56">
		<DropdownMenu.Item
			closeOnSelect={false}
			onSelect={() => {
				if ($boundariesMode === 'districts') {
					updateBoundariesMode('none');
				} else {
					updateBoundariesMode('districts');
				}
			}}
			class={cn('grid grid-cols-[auto_1fr_auto] items-center gap-2')}
		>
			<span
				class={cn(
					'size-4 rounded-full border border-primary',
					$boundariesMode === 'districts' && 'border-4 bg-foreground'
				)}
			></span>
			<span class={cn($boundariesMode === 'districts' && 'font-semibold', 'leading-tight')}>
				{@html $LL.map.layersSelection.districts()}
			</span>
			<InfoTooltip
				title={$LL.map.layersSelection.districtsTooltip.title()}
				description={$LL.map.layersSelection.districtsTooltip.description()}
			/>
		</DropdownMenu.Item>
		<DropdownMenu.Item
			closeOnSelect={false}
			onSelect={() => {
				if ($boundariesMode === 'lors') {
					updateBoundariesMode('none');
				} else {
					updateBoundariesMode('lors');
				}
			}}
			class={cn('grid grid-cols-[auto_1fr_auto] items-center gap-2')}
		>
			<span
				class={cn(
					'size-4 rounded-full border border-primary',
					$boundariesMode === 'lors' && 'border-4 bg-foreground'
				)}
			></span>
			<span class={cn($boundariesMode === 'lors' && 'font-semibold', 'leading-tight')}>
				{@html $LL.map.layersSelection.lors()}
			</span>
			<InfoTooltip
				title={$LL.map.layersSelection.lorsTooltip.title()}
				description={$LL.map.layersSelection.lorsTooltip.description()}
			/>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			closeOnSelect={false}
			onSelect={() => updateShowSatellite(!$showSatellite)}
			class={cn('grid grid-cols-[auto_1fr_auto] items-center gap-2')}
		>
			<CheckboxIcon checked={$showSatellite} />
			<span class={cn($showSatellite && 'font-semibold', 'leading-tight')}>
				{@html $LL.map.layersSelection.satellite()}
			</span>
			<InfoTooltip
				title={$LL.map.layersSelection.satelliteTooltip.title()}
				description={$LL.map.layersSelection.satelliteTooltip.description()}
			/>
		</DropdownMenu.Item>

		<DropdownMenu.Item
			closeOnSelect={false}
			onSelect={() => updateShowBuildings(!$showBuildings)}
			class={cn('grid grid-cols-[auto_1fr_auto] items-center gap-2')}
		>
			<CheckboxIcon checked={$showBuildings} />
			<span class={cn($showBuildings && 'font-semibold', 'leading-tight')}>
				{@html $LL.map.layersSelection.buildings()}
			</span>
			<InfoTooltip
				title={$LL.map.layersSelection.buildingsTooltip.title()}
				description={$LL.map.layersSelection.buildingsTooltip.description()}
			/>
		</DropdownMenu.Item>

		<!-- In the template, add this after the Buildings checkbox -->
		<DropdownMenu.Item
			closeOnSelect={false}
			onSelect={() => updateShowStreets(!$showStreets)}
			class={cn('grid grid-cols-[auto_1fr_auto] items-center gap-2')}
		>
			<CheckboxIcon checked={$showStreets} />
			<span class={cn($showStreets && 'font-semibold', 'leading-tight')}>
				{@html $LL.map.layersSelection.streets()}
			</span>
			<InfoTooltip
				title={$LL.map.layersSelection.streetsTooltip.title()}
				description={$LL.map.layersSelection.streetsTooltip.description()}
			/>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
