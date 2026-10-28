import type { StationMetadata } from '$lib/utils/schemas';
import { QueryClient } from '@tanstack/svelte-query';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StationsTable from './StationsTable.svelte';

const station = (id: string, district: string) =>
	({
		id,
		longName: id,
		district,
		latitude: 51.5,
		longitude: 7.4,
		stationType: 'temprh'
	}) as StationMetadata;

describe('StationsTable', () => {
	it('shows a dash for stations without a district', async () => {
		const screen = await render(StationsTable, {
			props: { stations: [station('A', 'Mitte'), station('B', '')] },
			context: new Map([['$$_queryClient', new QueryClient()]])
		});
		await expect.element(screen.getByText('Mitte')).toBeVisible();
		await expect.element(screen.getByRole('cell', { name: '-', exact: true })).toBeVisible();
	});
});
