// stands in for `page` of `$app/state` in tests (mocked in vitest-setup-client.ts and per test file);
// it is reactive like the real one, so set `page.url` to change the url
export const page = $state({
	url: new URL('http://localhost/en'),
	params: { lang: 'en' },
	status: 200
});
