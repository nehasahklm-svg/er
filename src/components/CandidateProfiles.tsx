import balenImg from "@/assets/balenshah.png";
import oliImg from "@/assets/kpoli.png";
import rspLogo from "@/assets/rsp.png";
import umlLogo from "@/assets/uml.png";

const candidates = [
  {
    name: "बालेन्द्र शाह (Balen Shah)",
    party: "RASTRIYA SWATANTRA PARTY (RSP)",
    photo: balenImg,
    logo: rspLogo,
    age: "35 Years",
    ageNepali: "उमेर: 36 वर्ष",
    birthPlace: "जन्मस्थान: काठमाडौं",
    permanentAddress: "स्थायी ठेगाना: काठमाडौं काठमाडौं महानगरपालिका",
    parents: "बाबु/आमा: राम नारायण शाह",
    politicalParty: "राजनीतिक दल: राष्ट्रिय स्वतन्त्र पार्टी",
    electionSymbol: "चुनाव चिन्ह: घण्टी",
    education: "M.Tech in Structural Engineering",
    educationNepali: "शैक्षिक योग्यता: BTU",
    background: "Structural Engineer, Youth Icon, Mayor of Kathmandu (2022-2026)",
    accent: "blue" as const,
    partyColor: "text-blue-600",
    bgGradient: "from-blue-600 to-blue-700",
  },
  {
    name: "के.पी शर्मा ओली (K.P. Sharma Oli)",
    party: "CPN-UML",
    photo: oliImg,
    logo: umlLogo,
    age: "74 Years",
    ageNepali: "उमेर: 74 वर्ष",
    birthPlace: "जन्मस्थान: तेह्रथुम",
    permanentAddress: "स्थायी ठेगाना: झापा भद्रपुर नगरपालिका",
    parents: "बाबु/आमा: मोहन प्रसाद ओली",
    politicalParty: "राजनीतिक दल: नेकपा (एमाले)",
    electionSymbol: "चुनाव चिन्ह: सूर्य",
    education: "Self-Educated / Honorary Degrees",
    educationNepali: "शैक्षिक योग्यता: स्नातक",
    background: "Former Prime Minister of Nepal, Chairman of CPN-UML",
    accent: "amber" as const,
    partyColor: "text-amber-600",
    bgGradient: "from-amber-600 to-amber-700",
  },
];

const CandidateProfiles = () => {
  return (
    <section id="profiles" className="scroll-mt-24">
      <div className="section-header">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 border-b border-border pb-2 sm:pb-4">
          <h2 className="section-title">Candidate Profiles</h2>
          <span className="label-xs text-xs">Verified details</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {candidates.map((c) => (
          <div key={c.name} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-border hover:shadow-2xl transition-shadow">
            {/* Photo Section */}
            <div className="relative h-56 sm:h-72 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
              <img 
                src={c.photo} 
                alt={`Portrait of ${c.name}`} 
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg">
                <img src={c.logo} alt={`${c.party} Logo`} className="w-8 h-8" />
              </div>
            </div>

            {/* Info Section */}
            <div className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{c.name}</h3>
              <p className={`text-sm font-bold uppercase tracking-wider mb-6 ${c.partyColor}`}>
                {c.party}
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AGE</p>
                    <p className="text-base font-semibold text-slate-900">{c.age}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">EDUCATION</p>
                    <p className="text-base font-semibold text-slate-900">{c.education}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">BACKGROUND</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{c.background}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CandidateProfiles;
