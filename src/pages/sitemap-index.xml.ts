import type { APIRoute } from 'astro';
import { getPrefixes } from '../lib/ifsc';

const SITE = 'https://banksin.in';

export const GET: APIRoute = () => {
	const prefixes = getPrefixes().sort();
	const lastmod = new Date().toISOString().slice(0, 10);

	const entries = [
		`${SITE}/sitemap.xml`,
		...prefixes.map((p) => `${SITE}/sitemap/${p}.xml`),
	];

	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		entries
			.map(
				(loc) =>
					`  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
			)
			.join('\n') +
		'\n</sitemapindex>\n';

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
