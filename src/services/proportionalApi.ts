export interface ProportionalPartyData {
  name: string;
  votes: number;
  symbolId: string;
  logoUrl: string;
}

// Fallback data from Election Commission (updated from live results)
// This ensures the page works even if the JSON API is blocked
const FALLBACK_DATA: ProportionalPartyData[] = [
  { name: "राष्ट्रिय स्वतन्त्र पार्टी", votes: 121994, symbolId: "2528", logoUrl: "https://result.election.gov.np/Images/symbol-hor-pa/2528.jpg?v=0.1" },
  { name: "नेपाली काँग्रेस", votes: 37205, symbolId: "101", logoUrl: "https://result.election.gov.np/Images/symbol-hor-pa/101.jpg?v=0.1" },
  { name: "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)", votes: 27845, symbolId: "102", logoUrl: "https://result.election.gov.np/Images/symbol-hor-pa/102.jpg?v=0.1" },
  { name: "राष्ट्रिय प्रजातन्त्र पार्टी", votes: 10791, symbolId: "2518", logoUrl: "https://result.election.gov.np/Images/symbol-hor-pa/2518.jpg?v=0.1" },
  { name: "नेपाली कम्युनिष्ट पार्टी", votes: 10629, symbolId: "2519", logoUrl: "https://result.election.gov.np/Images/symbol-hor-pa/2519.jpg?v=0.1" },
  { name: "श्रम संस्कृति पार्टी", votes: 6256, symbolId: "2520", logoUrl: "https://result.election.gov.np/Images/symbol-hor-pa/2520.jpg?v=0.1" },
  { name: "राष्ट्रिय परिवर्तन पार्टी", votes: 3888, symbolId: "2521", logoUrl: "https://result.election.gov.np/Images/symbol-hor-pa/2521.jpg?v=0.1" },
  { name: "नेपाल मजदुर किसान पार्टी", votes: 1338, symbolId: "103", logoUrl: "https://result.election.gov.np/Images/symbol-hor-pa/103.jpg?v=0.1" },
  { name: "नेपाल कम्युनिस्ट पार्टी (माओवादी)", votes: 541, symbolId: "104", logoUrl: "https://result.election.gov.np/Images/symbol-hor-pa/104.jpg?v=0.1" },
];

// Election Commission API response interface
interface ECPartyData {
  PoliticalPartyName: string;
  SymbolID: string;
  TotalWinningCandidate?: number;
  TotalGetVotes?: number;
  PartyID?: string;
}

export const fetchProportionalData = async (): Promise<{
  parties: ProportionalPartyData[];
  totalVotes: number;
}> => {
  try {
    // Try to fetch from Election Commission JSON API
    const response = await fetch('/election-gov-proxy/Handlers/SecureJson.ashx?file=JSONFiles/Election2082/Common/PRHoRPartyTop5.txt');
    
    if (!response.ok) {
      console.warn('JSON API returned error:', response.status, '- using fallback data');
      throw new Error(`API returned ${response.status}`);
    }
    
    const data: ECPartyData[] = await response.json();
    
    console.log('Fetched Election Commission data:', data);
    
    // Validate and transform data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data format');
    }
    
    const parties: ProportionalPartyData[] = data
      .filter(party => party.PoliticalPartyName && party.SymbolID)
      .map(party => ({
        name: party.PoliticalPartyName,
        votes: party.TotalGetVotes || 0,
        symbolId: String(party.SymbolID),
        logoUrl: `https://result.election.gov.np/Images/symbol-hor-pa/${party.SymbolID}.jpg?v=0.1`
      }));
    
    if (parties.length === 0 || parties.every(p => p.votes === 0)) {
      throw new Error('No valid vote data');
    }
    
    parties.sort((a, b) => b.votes - a.votes);
    const totalVotes = parties.reduce((sum, party) => sum + party.votes, 0);
    
    return { parties, totalVotes };
    
  } catch (error) {
    console.error("Error fetching from API, using fallback data:", error);
    
    // Return fallback data with correct symbol mappings
    const totalVotes = FALLBACK_DATA.reduce((sum, party) => sum + party.votes, 0);
    return {
      parties: FALLBACK_DATA,
      totalVotes
    };
  }
};
