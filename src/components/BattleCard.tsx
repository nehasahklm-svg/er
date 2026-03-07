import { Share2, TrendingUp, Award, Users } from "lucide-react";
import type { ElectionData } from "@/types/election";
import { useToast } from "@/hooks/use-toast";

interface BattleCardProps {
  electionData: ElectionData;
}

const BattleCard = ({ electionData }: BattleCardProps) => {
  const { toast } = useToast();
  
  // Extract candidate data
  const candidates = electionData.candidates;
  const candidate1 = candidates[0];
  const candidate2 = candidates[1];
  
  const VOTES_1 = candidate1.votes;
  const VOTES_2 = candidate2.votes;
  const TOTAL = electionData.totalVotes;
  const PCT_1 = ((VOTES_1 / TOTAL) * 100).toFixed(1);
  const PCT_2 = ((VOTES_2 / TOTAL) * 100).toFixed(1);
  const VOTE_DIFF = Math.abs(VOTES_1 - VOTES_2);
  const LEADING = VOTES_1 > VOTES_2 ? candidate1.name : candidate2.name;
  
  // Check if any candidate is elected
  const isElected = candidates.some(c => c.isElected);
  
  // Debug logging
  console.log('BattleCard Debug:', {
    constituency: electionData.constituency,
    percentageCounted: electionData.percentageCounted,
    candidates: candidates.map(c => ({
      name: c.name,
      isElected: c.isElected,
      remarksNepali: c.remarksNepali,
      remarks: c.remarks
    })),
    anyElected: isElected,
    showCompleted: isElected
  });

  const handleShare = async () => {
    const countingStatus = isElected
      ? "✅ Counting Completed (गणना सम्पन्न)"
      : `⏳ Counting: ${electionData.percentageCounted}% Complete`;

    const shareText = `🗳️ ${electionData.constituency.toUpperCase()} - LIVE RESULTS

👑 LEADING: ${LEADING}
━━━━━━━━━━━━━━━━━━━━━

${VOTES_1 > VOTES_2 ? '🥇' : '🥈'} ${candidate1.name}
📊 ${VOTES_1.toLocaleString()} votes (${PCT_1}%)
🏛️ ${candidate1.party}

${VOTES_2 > VOTES_1 ? '🥇' : '🥈'} ${candidate2.name}
📊 ${VOTES_2.toLocaleString()} votes (${PCT_2}%)
🏛️ ${candidate2.party}

━━━━━━━━━━━━━━━━━━━━━
📈 Vote Difference: ${VOTE_DIFF.toLocaleString()}
📊 Total Votes: ${TOTAL.toLocaleString()}
${countingStatus}

🌐 https://www.kpvsbalen.tech/
🚀 Developed by Wanted Soft`;

    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Results copied!",
        description: "Election results copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full overflow-visible bg-white rounded-3xl shadow-lg border border-slate-200 mb-6 sm:mb-12">
      {/* Header Section */}
      <div className="relative rounded-t-3xl px-4 py-3 sm:px-6" style={{ backgroundColor: '#084b92' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-2 py-1.5 sm:px-4 sm:py-2 border border-white/30">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wider">{electionData.constituency.toUpperCase()}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20">
              <Award className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-semibold text-white">
                {isElected ? `Winner: ${LEADING}` : `Leading: ${LEADING}`}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl border border-white/30 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white hidden sm:inline">Share</span>
          </button>
        </div>
        
        {/* Total Votes Info */}
        <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white/80" />
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Total Votes</p>
              <p className="text-lg font-bold text-white font-mono">{TOTAL.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-white/80" />
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Vote Difference</p>
              <p className="text-lg font-bold text-white font-mono">{VOTE_DIFF.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isElected ? (
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
              </div>
            )}
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
                {isElected ? 'गणना स्थिति' : 'Counting Progress'}
              </p>
              <div className="flex items-baseline gap-2">
                {isElected ? (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-green-300 font-mono">गणना सम्पन्न</p>
                    <span className="text-xs bg-green-500/30 text-green-100 px-2 py-0.5 rounded-full font-semibold">Completed</span>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-white font-mono">{electionData.percentageCounted}% Complete</p>
                )}
              </div>
              <p className="text-[10px] text-white/90 font-medium font-mono mt-0.5">{electionData.votesCounted.toLocaleString()} / {electionData.totalVotesCast.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Comparison Section */}
      <div className="grid md:grid-cols-2 gap-4 p-4 sm:gap-6 sm:p-6">
        {/* Candidate 1 */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative bg-slate-50 rounded-2xl p-4 sm:p-6 border-2 border-slate-200 hover:border-blue-300 transition-all duration-300">
            {VOTES_1 > VOTES_2 && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg animate-pulse">
                <Award className="w-5 h-5 text-white" />
              </div>
            )}
            
            {/* Candidate Photo & Info Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-shrink-0">
                <img 
                  alt={candidate1.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-200 shadow-lg" 
                  src={candidate1.photo}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/200x200/3b82f6/ffffff?text=' + encodeURIComponent(candidate1.name.charAt(0));
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-lg p-1 shadow-md">
                  <img 
                    alt={`${candidate1.party} Logo`} 
                    className="w-6 h-6 rounded-md object-contain" 
                    src={candidate1.partyLogo}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/100x100/cbd5e1/475569?text=P';
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {candidate1.party.split('(')[0].trim()}
                </p>
                <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">{candidate1.name}</h3>
                <p className="text-xs text-slate-600 truncate">{candidate1.nameNepali}</p>
                {candidate1.isElected && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg shadow-md">
                    <Award className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{candidate1.remarksNepali || 'निर्वाचित'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vote Count */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Votes</p>
              <p className="text-3xl sm:text-4xl font-black text-blue-600 font-mono mb-2">{VOTES_1.toLocaleString()}</p>
              
              {/* Progress Bar */}
              <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${PCT_1}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-semibold text-slate-600">Votes</span>
                <span className="text-xs sm:text-sm font-bold text-blue-600 truncate">{VOTES_1.toLocaleString()} / {TOTAL.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate 2 */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative bg-slate-50 rounded-2xl p-4 sm:p-6 border-2 border-slate-200 hover:border-purple-300 transition-all duration-300">
            {VOTES_2 > VOTES_1 && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg animate-pulse">
                <Award className="w-5 h-5 text-white" />
              </div>
            )}
            
            {/* Candidate Photo & Info Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-shrink-0">
                <img 
                  alt={candidate2.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-200 shadow-lg" 
                  src={candidate2.photo}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/200x200/a855f7/ffffff?text=' + encodeURIComponent(candidate2.name.charAt(0));
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-lg p-1 shadow-md">
                  <img 
                    alt={`${candidate2.party} Logo`} 
                    className="w-6 h-6 rounded-md object-contain" 
                    src={candidate2.partyLogo}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/100x100/cbd5e1/475569?text=P';
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {candidate2.party.split('(')[0].trim()}
                </p>
                <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">{candidate2.name}</h3>
                <p className="text-xs text-slate-600 truncate">{candidate2.nameNepali}</p>
                {candidate2.isElected && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg shadow-md">
                    <Award className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{candidate2.remarksNepali || 'निर्वाचित'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vote Count */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Votes</p>
              <p className="text-3xl sm:text-4xl font-black text-purple-600 font-mono mb-2">{VOTES_2.toLocaleString()}</p>
              
              {/* Progress Bar */}
              <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${PCT_2}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-semibold text-slate-600">Votes</span>
                <span className="text-xs sm:text-sm font-bold text-purple-600 truncate">{VOTES_2.toLocaleString()} / {TOTAL.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleCard;
