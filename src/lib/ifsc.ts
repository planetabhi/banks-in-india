import banksDataJSON from '../datasets/core/banksData.json';
import type { BanksData } from '../types/bank';

export interface Branch {
	ifsc: string;
	bank: string;
	branch: string;
	address: string;
	centre: string;
	district: string;
	city: string;
	state: string;
	contact: string;
	micr: string;
	neft: boolean;
	rtgs: boolean;
	imps: boolean;
	upi: boolean;
	swift: string;
}

export interface BankMeta {
	name: string;
	icon: string;
	website: string;
	category: string;
}

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Each bank prefix is a separate JSON chunk, loaded lazily on demand so a
// single request only pulls the one bank it needs (not the full ~58MB set).
const chunkLoaders = import.meta.glob('../datasets/ifsc/by-prefix/*.json');

const loaderByPrefix = new Map<string, () => Promise<Branch[]>>();
for (const [path, load] of Object.entries(chunkLoaders)) {
	const match = path.match(/\/([A-Z0-9]{4})\.json$/);
	if (match) {
		loaderByPrefix.set(match[1], async () => ((await load()) as { default: Branch[] }).default);
	}
}

const chunkCache = new Map<string, Branch[]>();

async function loadPrefix(prefix: string): Promise<Branch[]> {
	const key = prefix.trim().toUpperCase();
	const cached = chunkCache.get(key);
	if (cached) return cached;
	const loader = loaderByPrefix.get(key);
	const records = loader ? await loader() : [];
	chunkCache.set(key, records);
	return records;
}

// Bank logo / website / category (small dataset, safe to load eagerly).
let bankMeta: Map<string, BankMeta> | null = null;
function getMetaMap(): Map<string, BankMeta> {
	if (bankMeta) return bankMeta;
	bankMeta = new Map();
	const { banks } = banksDataJSON as BanksData;
	for (const group of banks) {
		for (const bank of group.content) {
			const prefix = (bank.ifsc || '').trim().toUpperCase();
			if (prefix && !bankMeta.has(prefix)) {
				bankMeta.set(prefix, {
					name: bank.name,
					icon: bank.icon,
					website: bank.website,
					category: group.category,
				});
			}
		}
	}
	return bankMeta;
}

export function isValidIfsc(code: string): boolean {
	return IFSC_RE.test(code);
}

export function getBankMeta(prefix: string): BankMeta | undefined {
	return getMetaMap().get(prefix.trim().toUpperCase());
}

export async function getBranch(code: string): Promise<Branch | undefined> {
	const normalized = code.trim().toUpperCase();
	const records = await loadPrefix(normalized.slice(0, 4));
	return records.find((r) => r.ifsc === normalized);
}

/** Branches of the same bank in the same city, excluding the given code. */
export async function getSiblings(code: string, limit = 12): Promise<Branch[]> {
	const normalized = code.trim().toUpperCase();
	const records = await loadPrefix(normalized.slice(0, 4));
	const self = records.find((r) => r.ifsc === normalized);
	if (!self) return [];
	const city = (self.city || '').trim().toUpperCase();
	const siblings: Branch[] = [];
	for (const r of records) {
		if (r.ifsc === normalized) continue;
		if ((r.city || '').trim().toUpperCase() !== city) continue;
		siblings.push(r);
		if (siblings.length >= limit) break;
	}
	return siblings;
}

export function getPrefixes(): string[] {
	return Array.from(loaderByPrefix.keys()).sort();
}

export async function getBranchesForPrefix(prefix: string): Promise<Branch[]> {
	return loadPrefix(prefix);
}
