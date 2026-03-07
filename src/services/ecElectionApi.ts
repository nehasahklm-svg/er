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

// Helper to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch with retry logic and exponential backoff
async function fetchECJson<T>(file: string, retries = 3): Promise<T> {
  const url = `${EC_BASE_FILE}${encodeURIComponent(file)}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url);
      
      // Handle rate limiting
      if (resp.status === 429) {
        if (attempt < retries) {
          const backoffTime = Math.min(1000 * Math.pow(2, attempt), 8000);
          console.warn(`Rate limited, retrying in ${backoffTime}ms...`);
          await delay(backoffTime);
          continue;
        }
        throw new Error(`Rate limit exceeded for ${file}`);
      }
      
      if (!resp.ok) {
        throw new Error(`EC API error ${resp.status} for ${file}`);
      }
      
      const text = await resp.text();
      // Strip UTF-8 BOM if present
      return JSON.parse(text.replace(/^\uFEFF/, '')) as T;
    } catch (error) {
      if (attempt === retries) throw error;
      // Wait before retry
      await delay(500 * (attempt + 1));
    }
  }
  
  throw new Error(`Failed to fetch ${file} after ${retries} retries`);
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
    gender: ec.Gender || 'N/A',
    address: ec.ADDRESS || 'N/A',
    provinceId: ec.State,
    provinceName: ec.StateName,
    districtId: ec.DistrictCd,
    districtName: ec.DistrictName,
    constituencyId: ec.SCConstID,
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

/**
 * Fetch all candidates across all constituencies
 * with optional filtering by province, district, and constituency
 * Optimized with rate limiting and batch processing
 */
export async function fetchAllCandidates(
  provinceId?: number,
  districtId?: number,
  constituencyId?: number
): Promise<ECCandidate[]> {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] 🔍 Fetching all candidates - Province: ${provinceId}, District: ${districtId}, Const: ${constituencyId}`);

  // Fetch district-constituency mapping
  const constituencyCounts = await fetchConstituencyCounts();
  const allCandidates: ECCandidate[] = [];

  // Determine which districts to fetch
  let targetDistricts = constituencyCounts;
  if (districtId) {
    targetDistricts = constituencyCounts.filter(d => d.distId === districtId);
  }
  
  // Filter by province first if specified
  if (provinceId) {
    const districts = await fetchDistricts();
    const provinceDistrictIds = districts
      .filter(d => d.parentId === provinceId)
      .map(d => d.id);
    targetDistricts = targetDistricts.filter(d => provinceDistrictIds.includes(d.distId));
  }

  // Limit to first 3 districts to avoid rate limiting
  // Users should use filters to narrow down results
  const limitedDistricts = targetDistricts.slice(0, districtId ? 1 : 3);
  
  console.log(`[${timestamp}] 📊 Fetching from ${limitedDistricts.length} districts`);

  // Fetch candidates from each constituency with rate limiting
  for (const dist of limitedDistricts) {
    const maxConsts = Math.min(dist.consts, 5); // Limit constituencies per district
    
    for (let constId = 1; constId <= maxConsts; constId++) {
      try {
        // Add delay to avoid rate limiting (250ms between requests)
        if (allCandidates.length > 0) {
          await delay(250);
        }
        
        const candidates = await fetchHORResults(dist.distId, constId);
        
        // Filter by constituency if specified
        if (constituencyId && candidates.length > 0) {
          const filtered = candidates.filter(c => c.SCConstID === String(constituencyId));
          if (filtered.length > 0) {
            allCandidates.push(...filtered);
            break; // Found the constituency, no need to continue
          }
        } else {
          allCandidates.push(...candidates);
        }
      } catch (error) {
        console.warn(`Failed to fetch District ${dist.distId}, Const ${constId}:`, error);
        // If we hit rate limit, wait longer before continuing
        if (error instanceof Error && error.message.includes('Rate limit')) {
          await delay(2000);
        }
      }
    }
  }

  console.log(`[${timestamp}] ✅ Fetched ${allCandidates.length} candidates`);
  return allCandidates;
}
