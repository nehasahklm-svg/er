import { useState, useRef, useEffect } from "react";
import { Loader2, ChevronDown, MapPin, Check, Globe } from "lucide-react";
import {
  useProvinces,
  useDistricts,
  useConstituencies,
  useECElectionData,
} from "@/hooks/useECElectionData";
import BattleCard from "@/components/BattleCard";

// ── Featured battles config ──────────────────────────────────────────────────
const FEATURED_BATTLES = [
  { dist: 4,  con: 5,  label: "झापा-५ (Jhapa-5)",     subtitle: "Balendra Shah vs KP Sharma Oli",              accentBg: "bg-blue-500",   accentText: "text-blue-500"   },
  { dist: 15, con: 3,  label: "सप्तरी-३ (Saptari-3)", subtitle: "Amarkant Chaudhary vs Upendra Yadav",          accentBg: "bg-purple-500", accentText: "text-purple-500" },
  { dist: 15, con: 1,  label: "सप्तरी-१ (Saptari-1)", subtitle: "Pushpa Kumari Chaudhary vs Ramdev Sah",        accentBg: "bg-orange-500", accentText: "text-orange-500" },
  { dist: 15, con: 4,  label: "सप्तरी-४ (Saptari-4)", subtitle: "Sitaram Sah vs Teju Lal Chaudhary",            accentBg: "bg-teal-500",   accentText: "text-teal-500"   },
  { dist: 15, con: 2,  label: "सप्तरी-२ (Saptari-2)", subtitle: "Ramji Yadav vs Umesh Kumar Yadav",             accentBg: "bg-rose-500",   accentText: "text-rose-500"   },
];

// ── Featured Battle Section component ───────────────────────────────────────
function FeaturedBattleSection({
  dist,
  con,
  label,
  subtitle,
  accentBg,
  accentText,
}: {
  dist: number;
  con: number;
  label: string;
  subtitle: string;
  accentBg: string;
  accentText: string;
}) {
  const { data, isLoading } = useECElectionData(dist, con);
  return (
    <div className="pt-4 border-t-2 border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className={`h-1 w-8 ${accentBg} rounded-full`} />
        <h2 className="text-xl font-bold text-slate-800">{label}</h2>
        <span className="text-sm text-slate-500 font-medium">{subtitle}</span>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className={`w-8 h-8 animate-spin ${accentText}`} />
        </div>
      ) : data && data.length > 0 ? (
        data.map((c) => <BattleCard key={c.constituency} electionData={c} />)
      ) : null}
    </div>
  );
}

// ── Cascading filter Dropdown ─────────────────────────────────────────────────
function Dropdown<T>({
  label,
  items,
  selected,
  onSelect,
  getLabel,
  getValue,
  disabled = false,
}: {
  label: string;
  items: T[];
  selected: T | undefined;
  onSelect: (item: T | undefined) => void;
  getLabel: (item: T) => string;
  getValue: (item: T) => string | number;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={`flex items-center gap-2 pl-3 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 hover:shadow transition-all text-sm font-medium text-slate-700 min-w-[140px] ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="truncate flex-1 text-left">
          {selected ? getLabel(selected) : label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden max-h-64 overflow-y-auto">
          <button
            onClick={() => {
              onSelect(undefined);
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <span>{label}</span>
            {!selected && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </button>
          {items.map((item) => (
            <button
              key={getValue(item)}
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span
                className={
                  selected && getValue(selected) === getValue(item)
                    ? "font-semibold text-blue-600"
                    : ""
                }
              >
                {getLabel(item)}
              </span>
              {selected && getValue(selected) === getValue(item) && (
                <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const HeroBattle = () => {
  const [selectedProvince, setSelectedProvince] = useState<
    { id: number; name: string } | undefined
  >(undefined);
  const [selectedDistrict, setSelectedDistrict] = useState<
    { id: number; name: string; parentId: number } | undefined
  >(undefined);
  const [selectedConst, setSelectedConst] = useState<number | undefined>(undefined);

  const { data: provinces, isLoading: provLoading } = useProvinces();
  const { data: districts } = useDistricts(selectedProvince?.id);
  const { data: constNums } = useConstituencies(selectedDistrict?.id);

  // Filter-driven query — only fires when both district AND constituency are chosen
  const { data: electionData, isLoading: filterLoading, isError: filterError, isFetching } =
    useECElectionData(selectedDistrict?.id, selectedConst);

  const isFilterComplete = !!selectedDistrict && !!selectedConst;

  // Reset district + constituency when province changes
  const handleProvinceChange = (p: typeof selectedProvince) => {
    setSelectedProvince(p);
    setSelectedDistrict(undefined);
    setSelectedConst(undefined);
  };

  // Reset constituency when district changes
  const handleDistrictChange = (d: typeof selectedDistrict) => {
    setSelectedDistrict(d);
    setSelectedConst(undefined);
  };

  // ── dummy block kept so the replacement anchor below still matches ──
  if (false) {
    return (
      <section id="live" className="scroll-mt-24 pb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-lg font-semibold text-muted-foreground">
              Loading election results...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (false) {
    return (
      <section id="live" className="scroll-mt-24 pb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">
              Failed to load election data
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try again later
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="live" className="scroll-mt-24 space-y-8 pb-12">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pb-3 border-b-2 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            {/* Live indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-green-50 px-3 py-2 rounded-xl border border-green-200 w-fit mb-2">
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping" />
              </div>
              <span className="font-semibold">
                {isFetching ? "Updating..." : "Auto-updating every 30s"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-1">
              Election 2082 Live Count
            </h1>
            <p className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Data from Nepal Election Commission (election.gov.np)
            </p>
          </div>
        </div>

        {/* ── Cascading filter: Province → District → Constituency ──────── */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filter:
          </span>

          {/* Province */}
          <Dropdown
            label="All Provinces"
            items={provinces ?? []}
            selected={selectedProvince}
            onSelect={handleProvinceChange}
            getLabel={(p) => p.name}
            getValue={(p) => p.id}
            disabled={provLoading}
          />

          {/* District — shows all districts when no province is selected */}
          <Dropdown
            label="All Districts"
            items={districts ?? []}
            selected={selectedDistrict}
            onSelect={handleDistrictChange}
            getLabel={(d) => d.name}
            getValue={(d) => d.id}
          />

          {/* Constituency — only visible once a district is chosen */}
          {selectedDistrict && constNums && constNums.length > 0 && (
            <Dropdown
              label="Select Constituency"
              items={constNums}
              selected={selectedConst}
              onSelect={(n) => setSelectedConst(n)}
              getLabel={(n) => `Constituency ${n}`}
              getValue={(n) => n}
            />
          )}
        </div>
      </div>

      {/* ── Filter-driven result card ─────────────────────────────────────── */}
      {!isFilterComplete ? (
        /* Placeholder: guide user to pick all three levels */
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-slate-100 rounded-3xl border-2 border-dashed border-blue-200">
          <MapPin className="w-10 h-10 text-blue-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">
            Select a Constituency to View Results
          </h3>
          <p className="text-sm text-slate-500 mb-5 text-center max-w-xs">
            Use the filters above to drill down and see the top two leading candidates for any constituency.
          </p>
          {/* Progress pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${selectedProvince ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedProvince ? "bg-green-500" : "bg-slate-400"}`} />
              Province
            </span>
            <span className="text-slate-300">→</span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${selectedDistrict ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedDistrict ? "bg-green-500" : "bg-slate-400"}`} />
              District
            </span>
            <span className="text-slate-300">→</span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${selectedConst ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedConst ? "bg-green-500" : "bg-slate-400"}`} />
              Constituency
            </span>
          </div>
        </div>
      ) : filterLoading ? (
        /* Loading spinner while fetching selected constituency */
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-lg font-semibold text-slate-500">
              Loading results for {selectedDistrict?.name} – Constituency {selectedConst}…
            </p>
          </div>
        </div>
      ) : filterError || !electionData || electionData.length === 0 ? (
        /* Error / empty state */
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-2xl border border-red-200 gap-2">
          <p className="text-red-600 font-semibold">
            No data found for {selectedDistrict?.name} – Constituency {selectedConst}
          </p>
          <p className="text-sm text-slate-500">Please try a different constituency.</p>
        </div>
      ) : (
        /* ✅ Show the BattleCard for the selected constituency (top-2 candidates) */
        <>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-8 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-800">
              {selectedDistrict?.name} – Constituency {selectedConst}
            </h2>
            <span className="text-xs font-semibold text-white bg-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Selected
            </span>
          </div>
          {electionData.map((c) => (
            <BattleCard key={c.constituency} electionData={c} />
          ))}
        </>
      )}

      {/* ── Featured battles (always shown below) ──────────────────────── */}
      {FEATURED_BATTLES.map((battle) => (
        <FeaturedBattleSection
          key={`${battle.dist}-${battle.con}`}
          dist={battle.dist}
          con={battle.con}
          label={battle.label}
          subtitle={battle.subtitle}
          accentBg={battle.accentBg}
          accentText={battle.accentText}
        />
      ))}
    </section>
  );
};

export default HeroBattle;

