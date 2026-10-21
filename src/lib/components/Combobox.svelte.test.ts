import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Combobox from './Combobox.svelte';

const options = [
	{ value: 'min', label: 'Minimum' },
	{ value: 'max', label: 'Maximum' }
];

describe('Combobox', () => {
	it('shows a placeholder without a default and reports the selection', async () => {
		const onChange = vi.fn();
		const screen = await render(Combobox, { options, onChange });
		const trigger = screen.getByRole('combobox');
		// KNOWN BUG: the english text contains the german one ("Select an optionOption auswählen")
		await expect.poll(() => trigger.element().textContent).toContain('Select an option');

		await trigger.click();
		await screen.getByRole('option', { name: 'Maximum' }).click();
		expect(onChange).toHaveBeenCalledWith('max');
		await expect.poll(() => trigger.element().textContent?.trim()).toBe('Maximum');
	});

	it('can filter the options', async () => {
		const screen = await render(Combobox, { options, searchable: true, defaultValue: 'min' });
		await screen.getByRole('combobox').click();
		await screen.getByRole('combobox').nth(1).fill('xyz');
		await expect.element(screen.getByText('No results')).toBeVisible();
	});

	it('works without a change handler', async () => {
		const screen = await render(Combobox, { options, defaultValue: 'min' });
		await screen.getByRole('combobox').click();
		await screen.getByRole('option', { name: 'Maximum' }).click();
		await expect
			.poll(() => screen.getByRole('combobox').element().textContent?.trim())
			.toBe('Maximum');
	});

	// KNOWN BUG: the english translation contains the german one. Remove `.fails` once fixed.
	it.fails('has an english placeholder', async () => {
		const screen = await render(Combobox, { options });
		await expect
			.element(screen.getByRole('combobox'), { timeout: 1000 })
			.toHaveTextContent('Select an option');
	});
});
