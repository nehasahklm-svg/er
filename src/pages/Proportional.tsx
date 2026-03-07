import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { fetchProportionalData, type ProportionalPartyData } from "@/services/proportionalApi";

const Proportional = () => {
  const [parties, setParties] = useState<ProportionalPartyData[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProportionalData();
        setParties(data.parties);
        setTotalVotes(data.totalVotes);
        setLoading(false);
      } catch (error) {
        console.error("Error loading proportional data:", error);
        setError("डाटा लोड गर्न सकिएन। कृपया पछि पुन: प्रयास गर्नुहोस्।");
        setLoading(false);
      }
    };

    loadData();
    
    // Auto refresh every 30 seconds for live updates
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-semibold">लोड हुँदैछ...</p>
            <p className="text-xs text-slate-500 mt-2">निर्वाचन आयोगबाट डाटा ल्याउँदै...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">त्रुटि</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              पुन: प्रयास गर्नुहोस्
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-full mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
              लाइभ डाटा - निर्वाचन आयोगबाट सिधै
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            समानुपातिक निर्वाचन परिणाम
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mb-6">
            समानुपातिक निर्वाचनमा मतगणनाको आधारमा दलगत स्थिति
          </p>
          <p className="text-xs text-slate-500 mb-4">
            (देशभरका मतगणना स्थलबाट प्रणालीमा प्रविष्टि भएको आधारमा गरिएको एकिकृत विवरण) *
          </p>
          
          {/* Total Votes Card */}
          <Card className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-white" />
              <div className="text-left">
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wide">प्रतिनिधि सभा - जम्मा मत</p>
                <p className="text-2xl font-black text-white font-mono">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parties.map((party, index) => {
            const percentage = ((party.votes / totalVotes) * 100).toFixed(2);
            const isTopParty = index < 3;
            
            return (
              <Card 
                key={index} 
                className={`p-4 hover:shadow-xl transition-all duration-300 ${
                  isTopParty ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white' : 'hover:border-blue-300'
                }`}
              >
                {isTopParty && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1 shadow-lg">
                    <p className="text-xs font-bold text-white">Top {index + 1}</p>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Party Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                      <img 
                        src={party.logoUrl} 
                        alt={party.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/100x100/cbd5e1/475569?text=Logo';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Party Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 mb-2 leading-tight line-clamp-2">
                      {party.name}
                    </h3>
                    
                    {/* Votes */}
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className={`w-4 h-4 ${isTopParty ? 'text-yellow-600' : 'text-blue-500'}`} />
                      <p className={`text-xl font-black font-mono ${isTopParty ? 'text-yellow-700' : 'text-blue-600'}`}>
                        {(party.votes || 0).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isTopParty 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    {/* Percentage */}
                    <p className="text-xs font-semibold text-slate-600">
                      {percentage}% मत
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-slate-500">
            * यो विवरण अस्थायी हो र यसमा समय समयमा परिवर्तन हुन सक्छ।
          </p>
          <p className="text-xs text-green-600 font-semibold">
            📡 पृष्ठ स्वचालित रूपमा हरेक ३० सेकेन्डमा अद्यावधिक हुन्छ
          </p>
          <p className="text-xs text-slate-400">
            डाटा स्रोत: निर्वाचन आयोग नेपाल (result.election.gov.np)
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Proportional;
