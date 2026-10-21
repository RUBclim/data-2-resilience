import { describe, expect, it } from 'vitest';
import { GET } from './+server';

describe('robots.txt', () => {
	it('allows crawling and points to the sitemap of the configured base url', async () => {
		const response = await GET();
		expect(response.headers.get('content-type')).toBe('text/plain');
		const body = await response.text();
		expect(body).toMatch(/Disallow: \n/);
		// PUBLIC_VITE_BASE_URL of .env.test
		expect(body).toContain('Sitemap: http://localhost:4173/sitemap.xml');
	});
});
