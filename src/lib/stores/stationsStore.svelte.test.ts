// runs in the browser project: the url query parameters are written through `goto`
import { goto } from '$app/navigation';
import { describe, expect, it, vi } from 'vitest';
import {
	deselectStation,
	selectMultipleStations,
	selectStation,
	toggleStationSelection
} from './stationsStore';

describe('station selection', () => {
	it('ignores calls without station ids', async () => {
		vi.mocked(goto).mockClear();
		toggleStationSelection(undefined);
		selectStation(undefined);
		deselectStation(undefined);
		selectMultipleStations([]);
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(goto).not.toHaveBeenCalled();

		selectStation('DOBHBF');
		await expect.poll(() => vi.mocked(goto).mock.calls.length).toBeGreaterThan(0);
	});
});
