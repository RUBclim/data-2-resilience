import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ErrorAlert from './ErrorAlert.svelte';

describe('ErrorAlert', () => {
	it('shows the error message', async () => {
		const screen = await render(ErrorAlert, { errorObject: new Error('  api down  ') });
		await expect.element(screen.getByText('Unexpected error')).toBeVisible();
		await expect.element(screen.getByText('api down', { exact: true })).toBeVisible();
	});

	it('works without an error object and with custom texts', async () => {
		const screen = await render(ErrorAlert, {
			errorObject: null,
			label: 'Custom label',
			description: 'Custom description'
		});
		await expect.element(screen.getByText('Custom label')).toBeVisible();
		await expect.element(screen.getByText('Custom description', { exact: false })).toBeVisible();
		expect(screen.container.querySelector('p.font-mono')).toBeNull();
	});
});
