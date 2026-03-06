/**
 * Nepal Election Commission (election.gov.np) API Service
 *
 * Uses a Vite dev-server proxy (/election-gov-proxy) that handles
 * session-cookie + CSRF-token authentication automatically.
 *
 * API path pattern:
 *   /election-gov-proxy/Handlers/SecureJson.ashx?file=<file>
 */

import type { ElectionData, Candidate } from '@/types/election';

const EC_PROXY = '/election-gov-proxy';
const EC_BASE_FILE = `${EC_PROXY}/Handlers/SecureJson.ashx?file=`;

// ─── Raw EC API Types ────────────────────────────────────────────────────────

export interface ECProvince {
  id: number;
  name: string; // Nepali name
}

export interface ECDistrict {
  id: number;
  name: string; // Nepali name
  parentId: number; // province id
}

export interface ECConstituencyCount {
  distId: number;
  consts: number;
}

export interface ECCandidate {
  CandidateName: string;
  Gender: string;
  Age: number;
  PartyID: number;
  SymbolID: number;
  SymbolName: string;
  CandidateID: number;
  StateName: string;
  PoliticalPartyName: string;
  ElectionPost: string | null;
  DistrictCd: number;
  DistrictName: string;
  State: number;
  SCConstID: string;
  SerialNo: number;
  TotalVoteReceived: number;
  CastedVote: number;
  TotalVoters: number;
  Rank: string;
  DOB?: string;
  CTZDIST?: string;
  FATHER_NAME?: string;
  SPOUCE_NAME?: string;
  QUALIFICATION?: string;
  EXPERIENCE?: string;
  OTHERDETAILS?: string;
  ADDRESS?: string;
}

// ─── In-memory caches ───────────────────────────────────────────────────────

let provincesCache: ECProvince[] | null = null;
let districtsCache: ECDistrict[] | null = null;
let constituenciesCache: ECConstituencyCount[] | null = null;



// ─── Fetch helpers ───────────────────────────────────────────────────────────

async function fetchECJson<T>(file: string): Promise<T> {
  const url = `${EC_BASE_FILE}${encodeURIComponent(file)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`EC API error ${resp.status} for ${file}`);
  const text = await resp.text();
  // Strip UTF-8 BOM if present
  return JSON.parse(text.replace(/^\uFEFF/, '')) as T;
}

// ─── Public lookup APIs ──────────────────────────────────────────────────────

export async function fetchProvinces(): Promise<ECProvince[]> {
  if (provincesCache) return provincesCache;
  provincesCache = await fetchECJson<ECProvince[]>(
    'JSONFiles/Election2082/Local/Lookup/states.json'
  );
  return provincesCache;
}

export async function fetchDistricts(): Promise<ECDistrict[]> {
  if (districtsCache) return districtsCache;
  districtsCache = await fetchECJson<ECDistrict[]>(
    'JSONFiles/Election2082/Local/Lookup/districts.json'
  );
  return districtsCache;
}

export async function fetchConstituencyCounts(): Promise<ECConstituencyCount[]> {
  if (constituenciesCache) return constituenciesCache;
  constituenciesCache = await fetchECJson<ECConstituencyCount[]>(
    'JSONFiles/Election2082/HOR/Lookup/constituencies.json'
  );
  return constituenciesCache;
}

// ─── Results API ─────────────────────────────────────────────────────────────

export async function fetchHORResults(distId: number, constId: number): Promise<ECCandidate[]> {
  return fetchECJson<ECCandidate[]>(
    `JSONFiles/Election2082/HOR/FPTP/HOR-${distId}-${constId}.json`
  );
}

// ─── Data transform ───────────────────────────────────────────────────────────

function transformECCandidate(ec: ECCandidate): Candidate {
  return {
    id: String(ec.CandidateID),
    name: ec.CandidateName,
    nameNepali: ec.CandidateName,
    party: ec.PoliticalPartyName,
    partyNepali: ec.PoliticalPartyName,
    votes: ec.TotalVoteReceived ?? 0,
    partyLogo: ec.SymbolID ? `/election-gov-proxy/Images/symbol-hor-pa/${ec.SymbolID}.jpg` : '',
    photo: `/election-gov-proxy/Images/Candidate/${ec.CandidateID}.jpg`,
    age: ec.Age ? `${ec.Age} Years` : 'N/A',
    education: ec.QUALIFICATION || 'N/A',
    background: ec.ADDRESS || ec.OTHERDETAILS || 'N/A',
    symbolName: ec.SymbolName || 'N/A',
    symbolCode: ec.SymbolID ?? 0,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetch election results for a given district + constituency.
 * Default: District 4 (Jhapa), Constituency 5 (Balendra vs KP Oli).
 */
export async function fetchECElectionData(
  distId = 4,
  constId = 5
): Promise<ElectionData[]> {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] 🇳🇵 Fetching EC results District=${distId} Const=${constId}`);

  const rawCandidates = await fetchHORResults(distId, constId);

  // Sort by votes descending
  rawCandidates.sort((a, b) => (b.TotalVoteReceived ?? 0) - (a.TotalVoteReceived ?? 0));

  const candidates = rawCandidates.map(transformECCandidate);
  const totalVotes = rawCandidates.reduce((s, c) => s + (c.TotalVoteReceived ?? 0), 0);

  // Build a readable constituency label
  const distName = rawCandidates[0]?.DistrictName ?? `District-${distId}`;
  const constituencyLabel = `${distName}-${constId}`;

  const result: ElectionData = {
    constituency: constituencyLabel,
    totalVotes,
    votesCounted: totalVotes,
    totalVotesCast: rawCandidates[0]?.TotalVoters || totalVotes,
    percentageCounted: rawCandidates[0]?.TotalVoters
      ? parseFloat(((totalVotes / rawCandidates[0].TotalVoters) * 100).toFixed(2))
      : 100,
    lastUpdated: new Date().toISOString(),
    candidates,
  };

  console.log(`[${timestamp}] ✅ ${candidates.length} candidates, ${totalVotes} votes for ${constituencyLabel}`);
  return [result];
}
