import type { APIRoute } from 'astro';
import { getBranchesForPrefix } from '../../lib/ifsc';

const SITE = 'https://banksin.in';

export const GET: APIRoute = async ({ params }) => {
	const prefix = (params.prefix || '').trim().toUpperCase();
	const branches = await getBranchesForPrefix(prefix);

	if (branches.length === 0) {
		return new Response('Not found', { status: 404 });
	}

	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		branches
			.map((b) => {
				const code = (b.ifsc || '').trim().toUpperCase();
				return `  <url>\n    <loc>${SITE}/ifsc/${code}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>`;
			})
			.join('\n') +
		'\n</urlset>\n';

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
