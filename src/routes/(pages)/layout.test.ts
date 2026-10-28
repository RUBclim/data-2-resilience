import { QueryClient } from '@tanstack/svelte-query';
import { describe, expect, it } from 'vitest';
import { load } from './+layout';

type LoadEvent = Parameters<typeof load>[0];
type LoadResult = { locale: string; queryClient: QueryClient; initialStationIds: string[] };

describe('root layout load', () => {
	it('loads the locale and creates a query client', async () => {
		const result = (await load({
			data: { locale: 'en', stationsGeoJson: null, stationsMetadata: [], initialStationIds: ['A'] }
		} as unknown as LoadEvent)) as LoadResult;
		expect(result).toMatchObject({ locale: 'en', initialStationIds: ['A'] });
		expect(result.queryClient).toBeInstanceOf(QueryClient);
		// queries only run in the browser
		expect(result.queryClient.getDefaultOptions().queries?.enabled).toBe(false);
	});

	it('defaults to english without server data', async () => {
		const result = await load({} as unknown as LoadEvent);
		expect(result).toMatchObject({ locale: 'en', initialStationIds: [] });
	});
});
