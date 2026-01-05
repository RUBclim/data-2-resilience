<script lang="ts">
	import { LL, locale } from '$i18n/i18n-svelte';
	import {
		createSvelteTable,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		renderComponent,
		sortingFns,
		type ColumnDef,
		type FilterFn,
		type OnChangeFn,
		type PaginationState,
		type SortingFn,
		type SortingState
	} from '$lib/components/table';
	import { searchQuery, updateSearchQuery } from '$lib/stores/uiStore';
	import { api } from '$lib/utils/api';
	import { reactiveQueryArgs } from '$lib/utils/queryUtils.svelte';
	import type { StationMetadata } from '$lib/utils/schemas';
	import { compareItems, rankItem } from '@tanstack/match-sorter-utils';
	import { createQuery } from '@tanstack/svelte-query';
	import DataDownloadButtonWithTooltip from './DataDownloadButtonWithTooltip.svelte';
	import HighlightedSearchQuery from './HighlightedSearchQuery.svelte';
	import SearchInputField from './SearchInputField.svelte';
	import SensorCoordinatesWithTooltip from './SensorCoordinatesWithTooltip.svelte';
	import Table from './Table.svelte';
	import StationDetailsButton from './StationDetailsButton.svelte';

	let { stations }: { stations: StationMetadata[] } = $props();

	const query = createQuery(
		reactiveQueryArgs(() => ({
			queryKey: ['stations'],
			queryFn: () => api().getStationsMetadata(),
			initialData: stations
		}))
	);
	let data = $derived($query?.data || []);

	let columns = [
		{
			header: () => $LL.pages.stations.table.headers.name(),
			accessorKey: 'longName',
			cell: (info) => {
				const text = info.getValue() as string;
				const searchQuery = info.table.getState().globalFilter;
				return renderComponent(HighlightedSearchQuery, { searchQuery, text });
			},
			sortingFn: (a, b) => a.original.longName.localeCompare(b.original.longName, $locale)
		},
		{
			header: () => $LL.pages.stations.table.headers.stationType(),
			accessorKey: 'stationType',
			cell: (info) => {
				const searchQuery = info.table.getState().globalFilter;
				const text =
					info.getValue() === 'biomet' || info.getValue() === 'double'
						? $LL.pages.stations.table.cells.stationTypes.biomet()
						: $LL.pages.stations.table.cells.stationTypes.temprh();
				return renderComponent(HighlightedSearchQuery, { text, searchQuery });
			}
		},
		{
			header: () => $LL.pages.stations.table.headers.id(),
			accessorKey: 'id',
			cell: (info) => {
				const text = info.getValue() as string;
				const searchQuery = info.table.getState().globalFilter;
				return renderComponent(HighlightedSearchQuery, { searchQuery, text });
			},
			sortingFn: (a, b) => a.original.id.localeCompare(b.original.id, $locale)
		},
		{
			header: () => $LL.pages.stations.table.headers.district(),
			accessorKey: 'district',
			cell: (info) => {
				const postalCode = info.getValue() as string;
				const val = postalCode || 'unknown';
				if (val === 'unknown') return '-';
				const searchQuery = info.table.getState().globalFilter;
				return renderComponent(HighlightedSearchQuery, { searchQuery, text: val });
			},
			sortingFn: (a, b) => a.original.district.localeCompare(b.original.district, $locale)
		},
		{
			header: () => $LL.pages.stations.table.headers.geolocation(),
			accessorKey: 'latitude',
			cell: (info) => {
				const { latitude, longitude } = info.row.original;
				const searchQuery = info.table.getState().globalFilter;
				return renderComponent(SensorCoordinatesWithTooltip, { searchQuery, latitude, longitude });
			},
			enableSorting: false
		},
		{
			header: () => $LL.pages.stations.table.headers.dataDownload(),
			accessorKey: 'longitude', // INFO: Using 'longitude' as a placeholder since using id with enableSorting: false would disable sorting for the id column
			cell: (info) => {
				const id = info.row.original.id;
				return renderComponent(DataDownloadButtonWithTooltip, { id });
			},
			enableSorting: false
		},
		{
			header: () => $LL.pages.stations.table.headers.metadata(),
			accessorKey: 'id',
			cell: (info) => {
				const id = info.getValue() as string;
				return renderComponent(StationDetailsButton, { id });
			},
			enableSorting: false
		}
	] satisfies ColumnDef<StationMetadata>[];

	const fuzzyFilter: FilterFn<any> = (row, columnId, searchTerm, addMeta) => {
		let value = row.getValue(columnId);

		if (columnId === 'stationType') {
			value = $LL.pages.stations.table.cells.stationTypes[value as 'biomet' | 'temprh']();
		} else if (typeof value === 'number') {
			value = value.toLocaleString($locale);
		}

		const itemRank = rankItem(value, searchTerm);
		addMeta({ itemRank });
		return itemRank.passed;
	};

	const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
		let dir = 0;

		// Only sort by rank if the column has ranking information
		if (rowA.columnFiltersMeta[columnId]) {
			dir = compareItems(
				// @ts-ignore
				rowA.columnFiltersMeta[columnId]?.itemRank!,
				// @ts-ignore
				rowB.columnFiltersMeta[columnId]?.itemRank!
			);
		}

		// Provide an alphanumeric fallback for when the item ranks are equal
		return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
	};

	let sorting: SortingState = $state([]);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 13 });

	const setSorting: OnChangeFn<SortingState> = (updater) => {
		if (updater instanceof Function) {
			sorting = updater(sorting);
		} else {
			sorting = updater;
		}
	};

	const setPagination: OnChangeFn<PaginationState> = (updater) => {
		if (updater instanceof Function) {
			pagination = updater(pagination);
		} else {
			pagination = updater;
		}
	};

	let table = createSvelteTable({
		get data() {
			return data || [];
		},
		columns,
		state: {
			get sorting() {
				return sorting;
			},
			get pagination() {
				return pagination;
			},
			get globalFilter() {
				return $searchQuery || undefined;
			}
		},
		getCoreRowModel: getCoreRowModel<StationMetadata>(),
		getFilteredRowModel: getFilteredRowModel<StationMetadata>(),
		getSortedRowModel: getSortedRowModel<StationMetadata>(),
		getPaginationRowModel: getPaginationRowModel<StationMetadata>(),
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		filterFns: { fuzzy: fuzzyFilter },
		sortingFns: { fuzzy: fuzzySort },
		globalFilterFn: fuzzyFilter
	});
</script>

<div class="min-h-full bg-muted pt-6 sm:pt-2">
	<div class="container flex min-h-full flex-col gap-6 py-8">
		<div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
			<h1 class="text-xl font-semibold">{$LL.pages.stations.titleTable()}</h1>
			<SearchInputField
				label={$LL.pages.stations.table.search.label()}
				placeholder={$LL.pages.stations.table.search.placeholder()}
				value={$searchQuery}
				onchange={updateSearchQuery}
			/>
		</div>
		<div class="rounded border border-border bg-background" id="stations-table">
			<Table {table} />
		</div>
	</div>
</div>
