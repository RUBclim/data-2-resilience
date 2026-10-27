<script lang="ts" generics="T extends RowData">
	import { locale } from '#i18n/i18n-svelte.js';
	import Button from './ui/button/button.svelte';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
	import { FlexRender, type RowData, type SvelteTable } from '@tanstack/svelte-table';
	import type { StationsTableFeatures } from './StationsTable.svelte';

	import {
		ArrowDownAZ,
		ArrowDownZA,
		ChevronFirst,
		ChevronLast,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';

	interface Props {
		// the feature APIs (sorting, pagination) are typed by the registered features
		table: SvelteTable<StationsTableFeatures, T>;
	}

	let { table }: Props = $props();
</script>

<Table>
	<TableHeader>
		{#each table.getHeaderGroups() as headerGroup}
			<TableRow>
				{#each headerGroup.headers as header}
					<TableHead colspan={header.colSpan}>
						{#if !header.isPlaceholder}
							<button
								type="button"
								class:cursor-pointer={header.column.getCanSort()}
								class:select-none={header.column.getCanSort()}
								onclick={header.column.getToggleSortingHandler()}
								class="flex items-center gap-2"
							>
								<FlexRender {header} />
								{#if header.column.getIsSorted().toString() === 'asc'}
									<ArrowDownAZ />
								{:else if header.column.getIsSorted().toString() === 'desc'}
									<ArrowDownZA />
								{/if}
							</button>
						{/if}
					</TableHead>
				{/each}
			</TableRow>
		{/each}
	</TableHeader>
	<TableBody>
		{#each table.getRowModel().rows.slice(0, table.atoms.pagination.get().pageSize) as row}
			<TableRow>
				{#each row.getVisibleCells() as cell}
					<TableCell>
						<FlexRender {cell} />
					</TableCell>
				{/each}
			</TableRow>
		{/each}
	</TableBody>
</Table>
<div class="flex items-center justify-end gap-2 border-t border-border p-2">
	<Button
		variant="outline"
		size="icon"
		onclick={() => table.firstPage()}
		disabled={!table.getCanPreviousPage()}
	>
		<ChevronFirst class="size-5" />
	</Button>
	<Button
		variant="outline"
		size="icon"
		onclick={() => table.previousPage()}
		disabled={!table.getCanPreviousPage()}
	>
		<ChevronLeft class="size-5" />
	</Button>
	<span class="flex items-center gap-1 px-4">
		<div>Page</div>
		<strong>
			{table.atoms.pagination.get().pageIndex + 1} of{' '}
			{table.getPageCount().toLocaleString($locale, {
				maximumFractionDigits: 0
			})}
		</strong>
	</span>
	<Button
		variant="outline"
		size="icon"
		onclick={() => table.nextPage()}
		disabled={!table.getCanNextPage()}
	>
		<ChevronRight class="size-5" />
	</Button>
	<Button
		variant="outline"
		size="icon"
		onclick={() => table.lastPage()}
		disabled={!table.getCanNextPage()}
	>
		<ChevronLast class="size-5" />
	</Button>
</div>
