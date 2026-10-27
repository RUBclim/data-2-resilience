<script lang="ts" module>
	type ClassesType = {
		root?: string;
		container?: string;
		header?: string;
		content?: string;
	};

	export const tooltipClasses = {
		root: 'w-56 bg-transparent chart-export-ignore opacity-0 group-hover:opacity-100',
		container: cn(
			'w-full border border-border shadow-lg p-3 group',
			'bg-background/80 backdrop-blur-xs'
		),
		content: 'w-full text-xs font-normal text-foreground shadow-none'
	} satisfies ClassesType;
</script>

<script lang="ts">
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import { unitOnly } from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import { MousePointer } from '@lucide/svelte';

	type BaseItemType = {
		id: string;
	};
	type QuantitativeType = Array<BaseItemType> & {
		x0: number | undefined;
		x1: number | undefined;
	};
	type OrdinalType = BaseItemType & {
		value: number;
		label: string;
		ids: string[];
	};
	type BaseProps = {
		selectedItems: {
			id: BaseItemType['id'];
			label: string;
		}[];
	};
	type Props =
		| (BaseProps & { type: 'quantitative'; item: QuantitativeType })
		| (BaseProps & { type: 'ordinal'; item: OrdinalType });

	let { item, type, selectedItems }: Props = $props();

	const catItem = $derived(item as OrdinalType);
	const numItem = $derived(item as QuantitativeType);
	const totalItems = $derived(type === 'quantitative' ? numItem?.length || 0 : catItem?.value || 0);

	const baseTooltipText = $derived.by(() => {
		if (type === 'quantitative') {
			return $LL.pages.measurements.histogram.tooltip.numberic({
				count: (numItem?.length || 0).toLocaleString($locale),
				start: (numItem?.x0 || 0).toLocaleString($locale),
				end: (numItem?.x1 || 0).toLocaleString($locale),
				unit: $unitOnly
			});
		}
		return $LL.pages.measurements.histogram.tooltip.category({
			count: catItem?.value.toLocaleString($locale),
			category: catItem?.label || ''
		});
	});

	const selectedItemsInBin = $derived.by(() => {
		if (type === 'quantitative') {
			const numItem = item as QuantitativeType;
			return selectedItems.filter((s) => {
				return numItem.find((d) => s.id === d.id);
			});
		}
		const catItem = item as OrdinalType;
		return selectedItems.filter((s) => {
			return catItem.ids.includes(s.id);
		});
	});

	const selectedItemsBaseText = $derived(
		$LL.pages.measurements.histogram.tooltip.stations(selectedItemsInBin.length)
	);
</script>

{@html baseTooltipText}
{#if totalItems > 0 && totalItems !== selectedItemsInBin.length}
	<small class="grid grid-cols-[auto_1fr] items-center gap-x-1 py-1 text-xs text-muted-foreground">
		<MousePointer class="size-3.5"></MousePointer>
		<span>{$LL.pages.measurements.histogram.tooltip.clickToSelect(totalItems)}</span>
	</small>
{/if}
{#if selectedItemsInBin.length > 0}
	<strong class="mt-2 block border-t border-border py-1">
		{@html selectedItemsBaseText}
	</strong>
	<ul class="list-muted-foreground flex flex-wrap gap-x-1 gap-y-0.5 text-sm">
		{#each selectedItemsInBin as sN, i}
			<li class="inline-block max-w-48 overflow-clip text-xs text-ellipsis">
				{@html sN.label}{i < selectedItemsInBin.length - 1 ? ', ' : ''}
			</li>
		{/each}
	</ul>
{/if}
