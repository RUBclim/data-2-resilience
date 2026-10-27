import type { StationMetadata } from '#lib/utils/schemas.js';
import WithQueryClient from '#lib/test-utils/WithQueryClient.svelte';
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
		const screen = await render(WithQueryClient, {
			component: StationsTable,
			componentProps: { stations: [station('A', 'Mitte'), station('B', '')] }
		});
		await expect.element(screen.getByText('Mitte')).toBeVisible();
		await expect.element(screen.getByRole('cell', { name: '-', exact: true })).toBeVisible();
	});
});
