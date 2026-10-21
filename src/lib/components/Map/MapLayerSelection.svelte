<script lang="ts">
	import { page } from '$app/state';
	import { LL, locale } from '$i18n/i18n-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
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
	} from '$lib/stores/uiStore';
	import { cn } from '$lib/utils';
	import type { Builder } from 'bits-ui';
	import CheckboxIcon from 'components/CheckboxIcon.svelte';
	import InfoTooltip from 'components/InfoTooltip.svelte';
	import Button from 'components/ui/button/button.svelte';
	import type { Props as ButtonProps } from 'components/ui/button/index.ts';
	import { Layers3 } from 'lucide-svelte';

	const isAboutPage = $derived(page.url.pathname.startsWith(`/${$locale}/about`));
	const showLeftSidebar = $derived(!isAboutPage && $isLeftSidebarOpened);
</script>

<DropdownMenu.Root closeOnItemClick={false}>
	<DropdownMenu.Trigger asChild aria-label={$LL.map.layersSelection.ariaLabel()}>
		{#snippet children({ builder }: { builder: Builder<ButtonProps> })}
			<Button
				builders={[builder]}
				variant="ghost"
				size="icon"
				class={cn(
					'fixed right-4 top-[calc(var(--headerHeight,5rem)+6rem)] z-50 flex flex-col gap-px',
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
	<DropdownMenu.Content align="end" class="w-56">
		<DropdownMenu.Item
			on:click={() => {
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
			on:click={() => {
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
			on:click={() => updateShowSatellite(!$showSatellite)}
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
			on:click={() => updateShowBuildings(!$showBuildings)}
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
			on:click={() => updateShowStreets(!$showStreets)}
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
