import { PUBLIC_VITE_BASE_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const body = robots();
	const response = new Response(body);
	response.headers.set('Cache-Control', 'max-age=0, s-maxage=3600');
	response.headers.set('Content-Type', 'text/plain');
	return response;
}

const robots = () => {
	return `
User-agent: *
Disallow: ${import.meta.env.PROD || import.meta.env.DEV ? '' : '/'}

Sitemap: ${PUBLIC_VITE_BASE_URL}/sitemap.xml
  `;
};
