import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import SearchInputField from './SearchInputField.svelte';

describe('SearchInputField', () => {
	it('works without handlers and shows its label', async () => {
		const screen = await render(SearchInputField, {
			label: 'Search stations',
			placeholder: 'Type…',
			value: ''
		});
		await expect.element(screen.getByText('Search stations')).toBeVisible();
		const input = screen.getByPlaceholder('Type…');
		await input.fill('abc');
		await userEvent.keyboard('{Enter}');
		await input.element().blur();
		await expect.element(input).toHaveValue('abc');
	});
});
