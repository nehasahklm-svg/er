// Internal Application Types
export interface Candidate {
  id: string;
  name: string;
  nameNepali: string;
  party: string;
  partyNepali: string;
  votes: number;
  partyLogo: string;
  photo: string;
  age: string;
  education: string;
  background: string;
  symbolName: string;
  symbolCode: number;
  gender?: string;
  address?: string;
  provinceId?: number;
  provinceName?: string;
  districtId?: number;
  districtName?: string;
  constituencyId?: string;
  isElected?: boolean;
  remarks?: string;
  remarksNepali?: string;
}

export interface ElectionData {
  constituency: string;
  totalVotes: number;
  votesCounted: number;
  totalVotesCast: number;
  percentageCounted: number;
  candidates: Candidate[];
  lastUpdated: string;
}
