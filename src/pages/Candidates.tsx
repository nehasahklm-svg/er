import { useState, useEffect } from "react";
import { User, MapPin, GraduationCap, Calendar, Users, Filter, AlertCircle, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPopup from "@/components/AdPopup";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAllCandidates,
  fetchProvinces,
  fetchDistricts,
  type ECCandidate,
  type ECProvince,
  type ECDistrict,
} from "@/services/ecElectionApi";

const Candidates = () => {
  const [candidates, setCandidates] = useState<ECCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<ECCandidate[]>([]);
  const [provinces, setProvinces] = useState<ECProvince[]>([]);
  const [districts, setDistricts] = useState<ECDistrict[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedConstituency, setSelectedConstituency] = useState<string>("all");

  // Fetch provinces and districts on mount
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        const [provincesData, districtsData] = await Promise.all([
          fetchProvinces(),
          fetchDistricts(),
        ]);
        
        setProvinces(provincesData);
        setDistricts(districtsData);
        setInitialLoad(false);
      } catch (error) {
        console.error("Error loading lookup data:", error);
        setError("डाटा लोड गर्न समस्या भयो। कृपया पृष्ठ रिफ्रेस गर्नुहोस्।");
        setInitialLoad(false);
        toast({
          title: "त्रुटि",
          description: "डाटा लोड गर्न समस्या। कृपया पुन: प्रयास गर्नुहोस्।",
          variant: "destructive",
        });
      }
    };

    loadLookupData();
  }, [toast]);

  // Load candidates when filters change
  useEffect(() => {
    if (initialLoad) return;

    const loadCandidates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const provinceId = selectedProvince !== "all" ? Number(selectedProvince) : undefined;
        const districtId = selectedDistrict !== "all" ? Number(selectedDistrict) : undefined;
        const constituencyNum = selectedConstituency !== "all" ? Number(selectedConstituency) : undefined;
        
        // Show only 8 candidates when no filters are selected
        const hasFilters = provinceId || districtId || constituencyNum;
        const limit = hasFilters ? undefined : 8;
        
        const candidatesData = await fetchAllCandidates(provinceId, districtId, constituencyNum, limit);
        
        setCandidates(candidatesData);
        setFilteredCandidates(candidatesData);
      } catch (error) {
        console.error("Error loading candidates:", error);
        const errorMessage = error instanceof Error ? error.message : "अज्ञात त्रुटि";
        
        if (errorMessage.includes("Rate limit") || errorMessage.includes("429")) {
          setError("धेरै अनुरोधहरू। कृपया फिल्टर प्रयोग गरेर परिणाम सीमित गर्नुहोस्।");
          toast({
            title: "दर सीमा पार",
            description: "धेरै अनुरोध। प्रदेश वा जिल्ला चयन गरेर फेरि प्रयास गर्नुहोस्।",
            variant: "destructive",
          });
        } else {
          setError(errorMessage);
          toast({
            title: "त्रुटि",
            description: "उम्मेदवार लोड गर्न समस्या। पुन: प्रयास गर्नुहोस्।",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [selectedProvince, selectedDistrict, selectedConstituency, initialLoad, toast]);

  // Get available districts for selected province
  const availableDistricts = selectedProvince === "all" 
    ? districts 
    : districts.filter(d => d.parentId === Number(selectedProvince));

  // Get unique constituencies
  const constituencies = Array.from(
    new Set(candidates.map(c => c.SCConstID))
  ).sort();

  // Get gender icon
  const getGenderIcon = (gender: string) => {
    if (gender === "Male" || gender === "पुरुष") {
      return "♂️";
    } else if (gender === "Female" || gender === "महिला") {
      return "♀️";
    }
    return "⚧️";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdPopup />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              उम्मेदवार खोज्नुहोस्
            </h1>
          </div>
          <p className="text-slate-600 ml-13">सबै उम्मेदवारहरूको विवरण खोज्नुहोस् र फिल्टर गर्नुहोस्</p>
        </div>

        {/* Filters */}
        <Card className="p-5 mb-6 shadow-md border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Filter className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">फिल्टर विकल्प</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Province Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                प्रदेश
              </label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="प्रदेश छान्नुहोस्" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सबै प्रदेश</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={String(province.id)}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                जिल्ला
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="जिल्ला छान्नुहोस्" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सबै जिल्ला</SelectItem>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district.id} value={String(district.id)}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Constituency Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                निर्वाचन क्षेत्र
              </label>
              <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
                <SelectTrigger className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="क्षेत्र छान्नुहोस्" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सबै क्षेत्र</SelectItem>
                  {constituencies.map((constituency) => (
                    <SelectItem key={constituency} value={constituency}>
                      {constituency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                    लोड हुँदैछ...
                  </span>
                ) : (
                  `कुल ${filteredCandidates.length} उम्मेदवार भेटियो`
                )}
              </p>
              {!loading && filteredCandidates.length > 0 && (
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1">
                  {filteredCandidates.length}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900 font-semibold">सूचना</AlertTitle>
          <AlertDescription className="text-blue-800">
            {selectedProvince === "all" && selectedDistrict === "all" && selectedConstituency === "all" 
              ? "८ उम्मेदवार देखाइएको छ। थप उम्मेदवार हेर्न प्रदेश वा जिल्ला छान्नुहोस्।"
              : "फिल्टर प्रयोग गरिएको छ। सबै उम्मेदवार देखाउनको लागि प्रदेश वा जिल्ला छान्नुहोस्।"
            }
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>त्रुटि भयो</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Initial State */}
        {initialLoad && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              तयार हुँदैछ...
            </h3>
            <p className="text-slate-500">
              फिल्टर विकल्पहरू लोड गरिँदैछ
            </p>
          </div>
        )}

        {/* Candidates Grid - Loading */}
        {!initialLoad && loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-20 h-20 rounded-full mb-3" />
                  <Skeleton className="w-32 h-4 mb-2" />
                  <Skeleton className="w-16 h-4 mb-3" />
                  <Skeleton className="w-full h-16 mb-3" />
                  <Skeleton className="w-full h-20 mb-3" />
                  <Skeleton className="w-full h-8" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Candidates Grid - Loaded */}
        {!initialLoad && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCandidates.map((candidate) => (
              <Card
                key={candidate.CandidateID}
                className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-blue-400 hover:-translate-y-1"
              >
                {/* Gradient Background Accent */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10" />
                
                <div className="relative p-4">
                  {/* Header Section */}
                  <div className="flex flex-col items-center text-center mb-3">
                    {/* Profile Image */}
                    <div className="relative mb-3">
                      <div className="relative w-20 h-20 rounded-full ring-4 ring-white shadow-lg overflow-hidden">
                        <img
                          src={`/election-gov-proxy/Images/Candidate/${candidate.CandidateID}.jpg`}
                          alt={candidate.CandidateName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.CandidateName)}&background=3b82f6&color=fff&size=80`;
                          }}
                        />
                      </div>
                      {/* Gender Badge */}
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm shadow-md border-2 border-white">
                        {getGenderIcon(candidate.Gender)}
                      </div>
                    </div>
                    
                    {/* Name */}
                    <h3 className="font-bold text-base text-slate-900 leading-tight mb-1 line-clamp-2">
                      {candidate.CandidateName}
                    </h3>
                    
                    {/* Age Badge */}
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-slate-100">
                      {candidate.Age} वर्ष
                    </Badge>

                    {/* Elected Badge */}
                    {(candidate.RemarksNep === 'निर्वाचित' || candidate.Remarks?.toLowerCase().includes('elected')) && (
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg shadow-md">
                        <Award className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{candidate.RemarksNep || 'निर्वाचित'}</span>
                      </div>
                    )}
                  </div>

                  {/* Party Section */}
                  <div className="mb-3 p-2.5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white rounded-lg p-1.5 shadow-sm flex-shrink-0">
                        <img
                          src={`/election-gov-proxy/Images/symbol-hor-pa/${candidate.SymbolID}.jpg`}
                          alt={candidate.PoliticalPartyName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.PoliticalPartyName)}&background=6366f1&color=fff&size=40`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-slate-900 truncate">
                          {candidate.PoliticalPartyName}
                        </p>
                        <p className="text-[10px] text-slate-600 truncate">{candidate.SymbolName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-2 mb-3">
                    {/* Location */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-500 font-medium">ठेगाना</p>
                        <p className="text-xs text-slate-800 truncate">
                          {candidate.ADDRESS || candidate.DistrictName}
                        </p>
                      </div>
                    </div>

                    {/* Qualification */}
                    {candidate.QUALIFICATION && (
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-500 font-medium">शैक्षिक योग्यता</p>
                          <p className="text-xs text-slate-800 truncate">{candidate.QUALIFICATION}</p>
                        </div>
                      </div>
                    )}

                    {/* Constituency */}
                    <div className="flex items-start gap-2">
                      <User className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-500 font-medium">निर्वाचन क्षेत्र</p>
                        <p className="text-xs text-slate-800 truncate">
                          {candidate.DistrictName} - {candidate.SCConstID}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Votes Section */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">प्राप्त मत</span>
                      <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-sm">
                        <span className="text-xs font-bold text-white">
                          {candidate.TotalVoteReceived?.toLocaleString() || 0} मत
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!initialLoad && !loading && filteredCandidates.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {selectedProvince === "all" && selectedDistrict === "all" && selectedConstituency === "all"
                ? "उम्मेदवार देखाउनको लागि फिल्टर छान्नुहोस्"
                : "कुनै उम्मेदवार भेटिएन"
              }
            </h3>
            <p className="text-slate-500 mb-4">
              {selectedProvince === "all" && selectedDistrict === "all" && selectedConstituency === "all"
                ? "प्रदेश वा जिल्ला छनोट गरेर उम्मेदवार खोज्नुहोस्"
                : "फिल्टर परिवर्तन गरेर पुन: प्रयास गर्नुहोस्"
              }
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>फिल्टर प्रयोग गर्नुहोस्</span>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Candidates;
