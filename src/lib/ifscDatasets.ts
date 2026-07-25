import banksDataJSON from '../datasets/core/banksData.json';
import type { BanksData } from '../types/bank';

export interface IfscDataset {
	/** 4-letter IFSC/bank prefix, e.g. "HDFC". */
	prefix: string;
	/** Bank display name (from banksData, falling back to the branch records). */
	bank: string;
	/** Category slug, e.g. "private_sector_banks". */
	category: string;
	/** Number of branch records in the dataset. */
	count: number;
}

interface BranchLite {
	bank?: string;
}

// One JSON chunk per bank prefix. Loaded lazily so the catalog and each
// download endpoint only parse what they need at build time.
const chunkLoaders = import.meta.glob<{ default: BranchLite[] }>(
	'../datasets/ifsc/by-prefix/*.json'
);

const loaderByPrefix = new Map<string, () => Promise<BranchLite[]>>();
for (const [path, load] of Object.entries(chunkLoaders)) {
	const match = path.match(/\/([A-Z0-9]{4})\.json$/);
	if (match) {
		loaderByPrefix.set(match[1], async () => (await load()).default);
	}
}

let metaCache: Map<string, { name: string; category: string }> | null = null;
function getMetaMap(): Map<string, { name: string; category: string }> {
	if (metaCache) return metaCache;
	metaCache = new Map();
	const { banks } = banksDataJSON as BanksData;
	for (const group of banks) {
		for (const bank of group.content) {
			const prefix = (bank.ifsc || '').trim().toUpperCase();
			if (prefix && !metaCache.has(prefix)) {
				metaCache.set(prefix, { name: bank.name, category: group.category });
			}
		}
	}
	return metaCache;
}

/** Every IFSC prefix that has a dataset on disk, sorted alphabetically. */
export function getIfscPrefixes(): string[] {
	return Array.from(loaderByPrefix.keys()).sort();
}

/** Raw branch records for a single prefix (used by the download endpoint). */
export async function loadPrefixRecords(prefix: string): Promise<BranchLite[]> {
	const loader = loaderByPrefix.get(prefix.trim().toUpperCase());
	return loader ? loader() : [];
}

/**
 * Catalog of all available IFSC datasets with branch counts and bank metadata.
 * Computed at build time; sorted by branch count (largest first).
 */
export async function getIfscDatasets(): Promise<IfscDataset[]> {
	const meta = getMetaMap();
	const prefixes = getIfscPrefixes();
	const datasets = await Promise.all(
		prefixes.map(async (prefix): Promise<IfscDataset> => {
			const records = await loadPrefixRecords(prefix);
			const info = meta.get(prefix);
			return {
				prefix,
				bank: info?.name || records[0]?.bank || prefix,
				category: info?.category || 'other',
				count: records.length,
			};
		})
	);
	return datasets.sort((a, b) => b.count - a.count || a.prefix.localeCompare(b.prefix));
}
