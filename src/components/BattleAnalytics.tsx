import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Candidate } from "@/types/election";

interface BattleAnalyticsProps {
  candidates: Candidate[];
}

const BattleAnalytics = ({ candidates }: BattleAnalyticsProps) => {
  const [balenCandidate, oliCandidate] = candidates;
  
  const BALEN_VOTES = balenCandidate.votes;
  const OLI_VOTES = oliCandidate.votes;
  const TOTAL = BALEN_VOTES + OLI_VOTES;
  const BALEN_PCT = Math.round((BALEN_VOTES / TOTAL) * 100);

  const pieData = [
    { name: balenCandidate.name, value: BALEN_VOTES, color: "hsl(233,50%,18%)" },
    { name: oliCandidate.name, value: OLI_VOTES, color: "hsl(37,42%,62%)" },
  ];

  return (
    <section id="analytics" className="scroll-mt-24">
      <div className="section-header">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 border-b border-border pb-2 sm:pb-4">
          <h2 className="section-title">Battle Analytics</h2>
          <span className="label-xs text-xs">Statistical view</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Donut Chart */}
        <div className="card-base rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 w-full text-left">Current Share</h3>
          <p className="label-xs text-[10px] mb-4 w-full text-left">Vote distribution</p>
          <div className="w-full flex-1 min-h-[240px] sm:min-h-[300px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{BALEN_PCT}%</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{balenCandidate.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vote Statistics */}
        <div className="lg:col-span-2 card-base rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">Vote Statistics</h3>
          <p className="label-xs text-[10px] mb-4">Live metrics</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="stat-card">
              <p className="label-xs text-[9px] sm:text-[10px] text-muted-foreground/80 mb-1">Total Votes</p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-card">{TOTAL.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="label-xs text-[9px] sm:text-[10px] text-muted-foreground/80 mb-1">Vote Difference</p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">{(BALEN_VOTES - OLI_VOTES).toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="label-xs text-[9px] sm:text-[10px] text-navy-light mb-1">{balenCandidate.name}</p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-card">{BALEN_VOTES.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{balenCandidate.partyNepali}</p>
            </div>
            <div className="stat-card">
              <p className="label-xs text-[9px] sm:text-[10px] text-gold-light mb-1">{oliCandidate.name}</p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-card">{OLI_VOTES.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{oliCandidate.partyNepali}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BattleAnalytics;
