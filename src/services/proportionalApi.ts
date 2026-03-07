export interface ProportionalPartyData {
  name: string;
  votes: number;
  symbolId: string;
  logoUrl: string;
}

interface ECPartyData {
  PoliticalPartyName: string;
  SymbolID: string;
  TotalVoteReceived?: number | string;
  [key: string]: any;
}

export const fetchProportionalData = async (): Promise<{
  parties: ProportionalPartyData[];
  totalVotes: number;
}> => {
  try {
    // Fetch party data from the same API that the official website uses
    // This endpoint contains party names, symbol IDs, and vote counts
    const apiResponse = await fetch('/election-gov-proxy/Handlers/SecureJson.ashx?file=JSONFiles/Election2082/Common/PRHoRPartyTop5.txt');
    const partyData: ECPartyData[] = await apiResponse.json();
    
    console.log('Fetched party data from API:', partyData.length, 'parties');
    
    // Build party list with vote counts from the API
    const parties: ProportionalPartyData[] = partyData
      .filter(party => party.PoliticalPartyName && party.SymbolID)
      .map(party => {
        // TotalVoteReceived contains the PR votes (same field used by official website)
        const votes = parseInt(String(party.TotalVoteReceived || 0), 10);
        
        return {
          name: party.PoliticalPartyName,
          votes: votes,
          symbolId: String(party.SymbolID),
          logoUrl: `https://result.election.gov.np/Images/symbol-hor-pa/${party.SymbolID}.jpg?v=0.1`
        };
      })
      .filter(party => party.votes > 0); // Only show parties with votes
    
    // Sort by votes descending
    parties.sort((a, b) => b.votes - a.votes);
    
    const totalVotes = parties.reduce((sum, party) => sum + party.votes, 0);
    
    console.log(`Processed data: ${parties.length} parties with votes`);
    console.log(`Total votes: ${totalVotes.toLocaleString()}`);
    
    // Log first few parties for debugging
    if (parties.length > 0) {
      console.log('Top 3 parties:', parties.slice(0, 3).map(p => `${p.name}: ${p.votes.toLocaleString()}`));
    }
    
    if (parties.length === 0) {
      console.warn('No parties have vote counts in the API yet. Vote counting may not have started or data may not be available.');
    }
    
    return {
      parties,
      totalVotes
    };
    
  } catch (error) {
    console.error("Error fetching proportional data:", error);
    throw error;
  }
};
