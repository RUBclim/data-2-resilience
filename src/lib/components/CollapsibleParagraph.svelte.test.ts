import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CollapsibleParagraph from './CollapsibleParagraph.svelte';

const text = (content: string) =>
	createRawSnippet(() => ({ render: () => `<p style="width: 200px">${content}</p>` }));

describe('CollapsibleParagraph', () => {
	it('can start expanded', async () => {
		const screen = await render(CollapsibleParagraph, {
			defaultIsExpanded: true,
			children: text('long text '.repeat(50))
		});
		await expect.element(screen.getByRole('button', { name: 'Collapse' })).toBeVisible();
	});

	it('has no toggle for short text', async () => {
		const screen = await render(CollapsibleParagraph, { children: text('short') });
		await expect.element(screen.getByText('short')).toBeVisible();
		await expect.element(screen.getByRole('button')).not.toBeInTheDocument();
	});

	it('re-checks when the content changes', async () => {
		const screen = await render(CollapsibleParagraph, { children: text('short') });
		await expect.element(screen.getByRole('button')).not.toBeInTheDocument();
		screen.container.querySelector('p')!.textContent = 'long text '.repeat(50);
		await expect.element(screen.getByRole('button', { name: 'Know more' })).toBeVisible();
	});
});
