import { setMode } from 'mode-watcher';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChartExportDropdown from './ChartExportDropdown.svelte';

const html2canvas = vi.hoisted(() => vi.fn(async () => document.createElement('canvas')));
vi.mock('html2canvas', () => ({ default: html2canvas }));

async function exportChart(screen: Awaited<ReturnType<typeof render>>) {
	// the trigger wraps a button
	await screen.getByRole('button').first().click();
	await screen.getByRole('menuitem', { name: 'Export chart' }).click();
}

describe('ChartExportDropdown', () => {
	afterEach(() => {
		document.getElementById('chart')?.remove();
		setMode('light');
	});

	it('ignores a chart that is not in the document', async () => {
		const screen = await render(ChartExportDropdown, { chartExportId: 'missing' });
		await exportChart(screen);
		await expect.element(screen.getByRole('button').first()).toBeEnabled();
		expect(html2canvas).not.toHaveBeenCalled();
	});

	it('exports on a dark background in dark mode', async () => {
		const chart = Object.assign(document.createElement('div'), { id: 'chart' });
		document.body.append(chart);
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		setMode('dark');
		const screen = await render(ChartExportDropdown, { chartExportId: 'chart' });
		await exportChart(screen);
		await expect.poll(() => click.mock.calls.length).toBe(1);
		expect(html2canvas).toHaveBeenCalledWith(
			chart,
			expect.objectContaining({ backgroundColor: '#030816' })
		);
	});
});
