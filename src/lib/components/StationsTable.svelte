<script module lang="ts">
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import {
		columnFilteringFeature,
		columnVisibilityFeature,
		createFilteredRowModel,
		createPaginatedRowModel,
		createSortedRowModel,
		createTable,
		filterFns,
		globalFilteringFeature,
		renderComponent,
		rowPaginationFeature,
		rowSortingFeature,
		sortFns,
		tableFeatures,
		type ColumnDef,
		type FilterFn,
		type OnChangeFn,
		type SortFn,
		type SortingState
	} from '@tanstack/svelte-table';
	import type { StationMetadata } from '#lib/utils/schemas.js';
	import { compareItems, rankItem, type RankingInfo } from '@tanstack/match-sorter-utils';
	import { get } from 'svelte/store';

	const baseFeatures = tableFeatures({
		columnFilteringFeature,
		columnVisibilityFeature,
		globalFilteringFeature,
		rowSortingFeature,
		rowPaginationFeature
	});
	type Features = typeof baseFeatures;

	const fuzzyFilter: FilterFn<Features, StationMetadata> = (row, columnId, searchTerm, addMeta) => {
		let value = row.getValue(columnId);

		if (columnId === 'stationType') {
			value = get(LL).pages.stations.table.cells.stationTypes[value as 'biomet' | 'temprh']();
		} else if (typeof value === 'number') {
			value = value.toLocaleString(get(locale));
		}

		const itemRank = rankItem(value, searchTerm);
		addMeta?.({ itemRank });
		return itemRank.passed;
	};

	const fuzzySort: SortFn<Features, StationMetadata> = (rowA, rowB, columnId) => {
		let dir = 0;
		// set by fuzzyFilter through addMeta
		const rankOf = (row: typeof rowA) =>
			(row.columnFiltersMeta[columnId] as { itemRank: RankingInfo } | undefined)?.itemRank;

		// Only sort by rank if the column has ranking information
		const rankA = rankOf(rowA);
		const rankB = rankOf(rowB);
		if (rankA && rankB) {
			dir = compareItems(rankA, rankB);
		}

		// Provide an alphanumeric fallback for when the item ranks are equal
		return dir === 0 ? sortFns.alphanumeric(rowA, rowB, columnId) : dir;
	};

	// v8 bundled all built-in sort and filter functions, and `'auto'` (the default sortFn of the
	// station type column) only resolves registered ones
	const features = tableFeatures({
		...baseFeatures,
		filteredRowModel: createFilteredRowModel(),
		sortedRowModel: createSortedRowModel(),
		paginatedRowModel: createPaginatedRowModel(),
		filterFns: { ...filterFns, fuzzy: fuzzyFilter },
		sortFns: { ...sortFns, fuzzy: fuzzySort }
	});
	export type StationsTableFeatures = typeof features;
</script>

<script lang="ts">
	import { searchQuery, updateSearchQuery } from '#lib/stores/uiStore.js';
	import { api } from '#lib/utils/api.js';
	import { createQuery } from '@tanstack/svelte-query';
	import DataDownloadButtonWithTooltip from './DataDownloadButtonWithTooltip.svelte';
	import HighlightedSearchQuery from './HighlightedSearchQuery.svelte';
	import SearchInputField from './SearchInputField.svelte';
	import SensorCoordinatesWithTooltip from './SensorCoordinatesWithTooltip.svelte';
	import Table from './Table.svelte';
	import StationDetailsButton from './StationDetailsButton.svelte';

	let { stations }: { stations: StationMetadata[] } = $props();

	const query = createQuery(() => ({
		queryKey: ['stations'],
		queryFn: () => api().getStationsMetadata(),
		initialData: stations
	}));
	let data = $derived(query?.data || []);

	let columns = [
		{
			header: () => $LL.pages.stations.table.headers.name(),
			accessorKey: 'longName',
			cell: (info) => {
				const text = info.getValue() as string;
				const searchQuery = info.table.atoms.globalFilter.get();
				return renderComponent(HighlightedSearchQuery, { searchQuery, text });
			},
			sortFn: (a, b) => a.original.longName.localeCompare(b.original.longName, $locale)
		},
		{
			header: () => $LL.pages.stations.table.headers.stationType(),
			accessorKey: 'stationType',
			cell: (info) => {
				const searchQuery = info.table.atoms.globalFilter.get();
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
				const searchQuery = info.table.atoms.globalFilter.get();
				return renderComponent(HighlightedSearchQuery, { searchQuery, text });
			},
			sortFn: (a, b) => a.original.id.localeCompare(b.original.id, $locale)
		},
		{
			header: () => $LL.pages.stations.table.headers.district(),
			accessorKey: 'district',
			cell: (info) => {
				const postalCode = info.getValue() as string;
				const val = postalCode || 'unknown';
				if (val === 'unknown') return '-';
				const searchQuery = info.table.atoms.globalFilter.get();
				return renderComponent(HighlightedSearchQuery, { searchQuery, text: val });
			},
			sortFn: (a, b) => a.original.district.localeCompare(b.original.district, $locale)
		},
		{
			header: () => $LL.pages.stations.table.headers.geolocation(),
			accessorKey: 'latitude',
			cell: (info) => {
				const { latitude, longitude } = info.row.original;
				const searchQuery = info.table.atoms.globalFilter.get();
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
	] satisfies ColumnDef<StationsTableFeatures, StationMetadata>[];

	let sorting: SortingState = $state([]);

	const setSorting: OnChangeFn<SortingState> = (updater) => {
		if (updater instanceof Function) {
			sorting = updater(sorting);
		} else {
			sorting = updater;
		}
	};

	let table = createTable({
		features,
		get data() {
			return data || [];
		},
		columns,
		// owned by the table: with a controlled pagination, every page change syncs the options again,
		// which recomputes the rows and resets the page (`autoResetPageIndex`)
		initialState: { pagination: { pageIndex: 0, pageSize: 13 } },
		state: {
			get sorting() {
				return sorting;
			},
			get globalFilter() {
				return $searchQuery || undefined;
			}
		},
		onSortingChange: setSorting,
		globalFilterFn: 'fuzzy'
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
