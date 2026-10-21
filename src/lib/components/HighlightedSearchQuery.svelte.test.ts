import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import HighlightedSearchQuery from './HighlightedSearchQuery.svelte';

describe('HighlightedSearchQuery', () => {
	it('renders the plain text without a query', async () => {
		const screen = await render(HighlightedSearchQuery, { text: 'Hauptbahnhof' });
		await expect.element(screen.getByText('Hauptbahnhof')).toBeVisible();
		expect(screen.container.querySelectorAll('span')).toHaveLength(0);
	});

	it('highlights every case insensitive match', async () => {
		const screen = await render(HighlightedSearchQuery, {
			text: 'Barop Bahnhof',
			searchQuery: 'ba'
		});
		const highlighted = [...screen.container.querySelectorAll('span.bg-primary\\/50')];
		expect(highlighted.map((s) => s.textContent?.trim())).toEqual(['Ba', 'Ba']);
	});

	// KNOWN BUG: the query is used as a regular expression without escaping, so typing e.g. "("
	// into the stations search throws. Flip this test once fixed.
	it('throws for queries with regular expression syntax (known bug)', async () => {
		await expect(
			render(HighlightedSearchQuery, { text: 'Station (alt)', searchQuery: '(' })
		).rejects.toThrow(/Invalid regular expression/);
	});
});
