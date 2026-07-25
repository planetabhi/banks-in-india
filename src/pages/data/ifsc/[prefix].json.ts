import type { APIRoute, GetStaticPaths } from 'astro';
import { getIfscPrefixes, loadPrefixRecords } from '../../../lib/ifscDatasets';

export const getStaticPaths: GetStaticPaths = () =>
	getIfscPrefixes().map((prefix) => ({ params: { prefix } }));

export const GET: APIRoute = async ({ params }) => {
	const prefix = (params.prefix || '').trim().toUpperCase();
	const records = await loadPrefixRecords(prefix);

	return new Response(JSON.stringify(records), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=86400',
		},
	});
};
