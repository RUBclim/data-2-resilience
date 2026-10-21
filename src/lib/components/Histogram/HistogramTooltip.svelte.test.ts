import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HistogramTooltip from './HistogramTooltip.svelte';

const selectedItems = [
	{ id: 'A', label: 'Station A' },
	{ id: 'C', label: 'Station C' }
];

describe('HistogramTooltip', () => {
	it('describes a bin of values starting at zero', async () => {
		const item = Object.assign([{ id: 'A' }, { id: 'B' }], { x0: 0, x1: 5 });
		const screen = await render(HistogramTooltip, { type: 'quantitative', item, selectedItems });
		await expect.element(screen.getByText(/with values between/)).toBeVisible();
		expect(screen.container.textContent).toMatch(
			/There are\s*2\s*stations with values between\s*0/
		);
		await expect.element(screen.getByText('Click to select 2 stations.')).toBeVisible();
		await expect.element(screen.getByText('Station A')).toBeVisible();
	});

	it('describes an empty bin ending at zero', async () => {
		const item = Object.assign([], { x0: -5, x1: 0 });
		const screen = await render(HistogramTooltip, { type: 'quantitative', item, selectedItems });
		expect(screen.container.textContent).toMatch(
			/There are\s*0\s*stations with values between\s*-5/
		);
		expect(screen.container.textContent).toMatch(/and\s*0/);
		expect(screen.container.textContent).not.toContain('Click to select');
	});

	it('describes an empty category', async () => {
		const item = { id: 'none', value: 0, label: 'No thermal stress', ids: [] };
		const screen = await render(HistogramTooltip, { type: 'ordinal', item, selectedItems });
		expect(screen.container.textContent).toMatch(/There are\s*0\s*stations values/);
		expect(screen.container.textContent).not.toContain('Click to select');
		expect(screen.container.textContent).not.toContain('Including');
	});

	it('lists the selected stations of a category', async () => {
		const item = { id: 'x', value: 2, label: 'Strong heat stress', ids: ['A', 'C'] };
		const screen = await render(HistogramTooltip, { type: 'ordinal', item, selectedItems });
		await expect.element(screen.getByText('Station C')).toBeVisible();
		expect(screen.container.textContent).not.toContain('Click to select');
	});
});
