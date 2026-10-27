<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import {
		deselectAllStations,
		deselectStation,
		selectStation,
		useStations
	} from '#lib/stores/stationsStore.js';
	import { cn } from '#lib/utils.js';
	import type { StationMetadata } from '#lib/utils/schemas.js';
	import MultiSelect, { type ObjectOption, type Option } from 'svelte-multiselect';

	interface Props {
		stations: {
			type: 'FeatureCollection';
			features: GeoJSON.Feature<GeoJSON.Point, StationMetadata>[];
		};
		initialStationIds?: string[];
	}

	let { stations, initialStationIds = [] }: Props = $props();

	// svelte-ignore state_referenced_locally
	const selectedStations = useStations({ initialStationIds, stations });

	let formattedStations = $derived(
		stations.features
			.map((s) => ({
				id: s.properties.id,
				value: s.properties.id,
				label: s.properties.longName
			}))
			.sort((a, b) => a.label.localeCompare(b.label))
	);
	let formattedSelectedStations = $derived(
		$selectedStations
			.map((id) => ({
				id,
				value: id,
				label: formattedStations.find((s) => s.value === id)?.label || id
			}))
			.sort((a, b) => a.label.localeCompare(b.label))
	);

	function onAdd({ option }: { option: Option }) {
		const opt = option as ObjectOption;
		const val = opt.value as string;
		if (!val) return;
		selectStation(val);
	}

	function onRemove({ option }: { option: Option }) {
		const opt = option as ObjectOption;
		const val = opt.value as string;
		if (!val) return;
		deselectStation(val);
	}

	function onRemoveAll() {
		deselectAllStations();
	}
</script>

<div class="mt-7 scroll-mt-20 border-t border-border pt-5" id="stations-select-wrapper">
	<label for="stations-select" class="inline-block w-fit pb-3">
		{$LL.pages.measurements.stationsSelect.label()}:
	</label>
	<div
		class={cn(
			'multiselect-wrapper mb-4',
			'[&:has(input:focus-visible)]:ring-2 [&:has(input:focus-visible)]:ring-ring [&:has(input:focus-visible)]:outline-hidden',
			'[&:has(input:focus-visible)]:ring-offset-2 [&:has(input:focus-visible)]:ring-offset-background',
			'[&:has(input:focus-visible)]:rounded-md [&:has(input:focus-visible)]:bg-background'
		)}
	>
		<MultiSelect
			selected={formattedSelectedStations}
			options={formattedStations}
			onadd={onAdd}
			onremove={onRemove}
			onremoveAll={onRemoveAll}
			outerDivClass="multiselect"
			selectedOptionsDraggable={false}
			placeholder={$LL.pages.measurements.stationsSelect.placeholder()}
			id="stations-select"
			name="stations-select"
		/>
	</div>
</div>

<style>
	.multiselect-wrapper {
		--sms-border: 1px solid hsl(var(--border));
		--sms-border-radius: 0.4rem;
		--sms-padding: 0.25rem 0.5rem;
		--sms-bg: hsl(var(--background));
		--sms-text-color: hsl(var(--foreground));
		--sms-min-height: 2rem;
		--sms-width: 100%;
		--sms-max-width: 100%;
		--sms-margin: 0;
		--sms-font-size: inherit;
		--sms-active-color: hsl(var(--primary));
		--sms-focus-border: 1px solid hsl(var(--border));
		--sms-disabled-bg: hsl(var(--muted));
		--sms-placeholder-color: hsl(var(--muted-foreground));
		--sms-placeholder-opacity: 0.5;
		--sms-selected-bg: hsl(var(--primary));
		--sms-selected-li-padding: 0.25rem 0.5rem;
		--sms-selected-text-color: hsl(var(--primary-foreground));
		--sms-remove-btn-hover-color: hsl(var(--destructive));
		--sms-remove-btn-hover-bg: hsl(var(--destructive-foreground));
		--sms-options-bg: hsl(var(--background));
		--sms-options-max-height: 50vh;
		--sms-options-overscroll: none;
		--sms-options-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
		--sms-options-border: 1px solid hsl(var(--border));
		--sms-options-border-width: 1px;
		--sms-options-border-radius: 0.25rem;
		--sms-options-padding: 0.25rem;
		--sms-options-margin: 0;
		--sms-options-scroll-margin: 6rem;
		--sms-li-selected-bg: hsl(var(--foreground));
		--sms-li-selected-color: hsl(var(--background));
		--sms-li-active-bg: hsl(var(--muted));
	}

	/* !important: svelte-multiselect sets `display: flex` inline since 11.x */
	.multiselect-wrapper :global(.multiselect > .expand-icon) {
		display: none !important;
	}

	/* svelte-multiselect 11.0 drew the cross icons 15px wide and high; later versions size them
	   with `height: 1em` and the remove-all icon with 17px */
	.multiselect-wrapper :global(div.multiselect button.remove svg) {
		width: 15px !important;
		height: 15px;
	}

	/* svelte-multiselect styles its buttons with :is() instead of zero-specificity :where() since
	   11.x, which overrides the button reset of tailwind's preflight */
	.multiselect-wrapper :global(div.multiselect button) {
		margin: 0;
		padding: 0;
		aspect-ratio: auto;
	}

	.multiselect-wrapper :global(button.remove:focus-visible) {
		box-shadow:
			0 0 0 2px hsl(var(--ring)),
			0 0 0 4px hsl(var(--background));
	}

	.multiselect-wrapper :global(button.remove-all:focus-visible) {
		box-shadow:
			0 0 0 4px hsl(var(--background)),
			0 0 0 6px hsl(var(--ring));
	}

	.multiselect-wrapper :global(ul.options li[role='option']) {
		font-size: 0.875rem;
		border-radius: 0.25rem;
	}
</style>
