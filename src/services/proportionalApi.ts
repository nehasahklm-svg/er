export interface ProportionalPartyData {
  name: string;
  votes: number;
  symbolId: string;
  logoUrl: string;
}

// Election Commission API response interface
interface ECPartyData {
  PoliticalPartyName: string;
  SymbolID: string;
  TotalWinningCandidate: number;
  TotalGetVotes: number;
  PartyID: string;
}

export const fetchProportionalData = async (): Promise<{
  parties: ProportionalPartyData[];
  totalVotes: number;
}> => {
  try {
    // Fetch actual JSON data from Election Commission
    // This endpoint provides the exact party names and their correct symbol IDs
    const response = await fetch('/election-gov-proxy/Handlers/SecureJson.ashx?file=JSONFiles/Election2082/Common/PRHoRPartyTop5.txt');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const data: ECPartyData[] = await response.json();
    
    // Transform Election Commission data to our format
    const parties: ProportionalPartyData[] = data.map(party => ({
      name: party.PoliticalPartyName,
      votes: party.TotalGetVotes,
      symbolId: party.SymbolID,
      logoUrl: `https://result.election.gov.np/Images/symbol-hor-pa/${party.SymbolID}.jpg?v=0.1`
    }));
    
    // Sort by votes descending
    parties.sort((a, b) => b.votes - a.votes);
    
    // Calculate total votes
    const totalVotes = parties.reduce((sum, party) => sum + party.votes, 0);
    
    return {
      parties,
      totalVotes
    };
    
  } catch (error) {
    console.error("Error fetching proportional data:", error);
    throw error;
  }
};
