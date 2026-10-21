import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InfoTooltip from './InfoTooltip.svelte';

describe('InfoTooltip', () => {
	it('renders nothing without a title and a description', async () => {
		const screen = await render(InfoTooltip, {});
		expect(screen.container.querySelector('button')).toBeNull();
	});

	it('shows a label next to the icon and only the given texts', async () => {
		const screen = await render(InfoTooltip, {
			description: 'Some <em>details</em>',
			triggerLabel: 'More'
		});
		await expect.element(screen.getByText('More')).toBeVisible();
		await screen.getByRole('button').hover();
		await expect.element(screen.getByText('details')).toBeVisible();
		expect(document.querySelector('strong.text-base')).toBeNull();
	});

	it('shows only a title', async () => {
		const screen = await render(InfoTooltip, { title: 'A title' });
		await screen.getByRole('button').hover();
		await expect.element(screen.getByText('A title')).toBeVisible();
		expect(document.querySelector('p.text-pretty')).toBeNull();
	});
});
