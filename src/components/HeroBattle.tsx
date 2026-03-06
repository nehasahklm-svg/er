import { useState, useRef, useEffect } from "react";
import { Loader2, ChevronDown, MapPin, Check, Globe } from "lucide-react";
import {
  useProvinces,
  useDistricts,
  useConstituencies,
  useECElectionData,
} from "@/hooks/useECElectionData";
import BattleCard from "@/components/BattleCard";

// ── Default: Jhapa-5 (Balendra vs KP Oli) ──────────────────────────────────
const DEFAULT_DIST = 4;
const DEFAULT_CONST = 5;

// ── Featured battle 2: Saptari-3 (Amarkant Chaudhary vs Upendra Yadav) ──────
const SAPTARI_DIST = 15;
const SAPTARI_CONST = 3;

// ── Featured battle 3: Saptari-1 (Pushpa Kumari Chaudhary vs Ramdev Sah) ──────
const SAPTARI1_DIST = 15;
const SAPTARI1_CONST = 1;

// ── Featured battle 4: Saptari-4 (Sitaram Sah vs Teju Lal Chaudhary) ──────
const SAPTARI4_DIST = 15;
const SAPTARI4_CONST = 4;

// ── Featured battle 5: Saptari-2 (Ramji Yadav vs Umesh Kumar Yadav) ──────
const SAPTARI2_DIST = 15;
const SAPTARI2_CONST = 2;

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
  >({ id: DEFAULT_DIST, name: "झापा", parentId: 1 });
  const [selectedConst, setSelectedConst] = useState<number | undefined>(DEFAULT_CONST);

  const { data: provinces, isLoading: provLoading } = useProvinces();
  const { data: districts } = useDistricts(selectedProvince?.id);
  const { data: constNums } = useConstituencies(selectedDistrict?.id);

  const distId = selectedDistrict?.id ?? DEFAULT_DIST;
  const constId = selectedConst ?? DEFAULT_CONST;

  const { data: electionData, isLoading, isError, isFetching } = useECElectionData(
    distId,
    constId
  );

  // Second featured battle — Saptari-3
  const { data: saptariData, isLoading: saptariLoading } = useECElectionData(
    SAPTARI_DIST,
    SAPTARI_CONST
  );

  // Third featured battle — Saptari-1
  const { data: saptari1Data, isLoading: saptari1Loading } = useECElectionData(
    SAPTARI1_DIST,
    SAPTARI1_CONST
  );

  // Fourth featured battle — Saptari-4
  const { data: saptari4Data, isLoading: saptari4Loading } = useECElectionData(
    SAPTARI4_DIST,
    SAPTARI4_CONST
  );

  // Fifth featured battle — Saptari-2
  const { data: saptari2Data, isLoading: saptari2Loading } = useECElectionData(
    SAPTARI2_DIST,
    SAPTARI2_CONST
  );

  // Reset district when province changes
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

  if (isLoading && !electionData) {
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

  if (isError || !electionData) {
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
      {/* Header */}
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

        {/* Filter row */}
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

          {/* District */}
          <Dropdown
            label="All Districts"
            items={districts ?? []}
            selected={selectedDistrict}
            onSelect={handleDistrictChange}
            getLabel={(d) => d.name}
            getValue={(d) => d.id}
          />

          {/* Constituency */}
          {constNums && constNums.length > 0 && (
            <Dropdown
              label="All Constituencies"
              items={constNums}
              selected={selectedConst}
              onSelect={(n) => setSelectedConst(n)}
              getLabel={(n) => `Constituency ${n}`}
              getValue={(n) => n}
            />
          )}
        </div>
      </div>

      {/* Results */}
      {electionData.length > 0 ? (
        electionData.map((c) => (
          <BattleCard key={c.constituency} electionData={c} />
        ))
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
          <p className="text-lg text-slate-500 font-medium">
            No data available for the selected filter
          </p>
        </div>
      )}

      {/* Featured battle 2: Saptari-3 */}
      <div className="pt-4 border-t-2 border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-8 bg-purple-500 rounded-full" />
          <h2 className="text-xl font-bold text-slate-800">सप्तरी-३ (Saptari-3)</h2>
          <span className="text-sm text-slate-500 font-medium">Amarkant Chaudhary vs Upendra Yadav</span>
        </div>
        {saptariLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : saptariData && saptariData.length > 0 ? (
          saptariData.map((c) => (
            <BattleCard key={c.constituency} electionData={c} />
          ))
        ) : null}
      </div>

      {/* Featured battle 3: Saptari-1 */}
      <div className="pt-4 border-t-2 border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-8 bg-orange-500 rounded-full" />
          <h2 className="text-xl font-bold text-slate-800">सप्तरी-१ (Saptari-1)</h2>
          <span className="text-sm text-slate-500 font-medium">Pushpa Kumari Chaudhary vs Ramdev Sah</span>
        </div>
        {saptari1Loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : saptari1Data && saptari1Data.length > 0 ? (
          saptari1Data.map((c) => (
            <BattleCard key={c.constituency} electionData={c} />
          ))
        ) : null}
      </div>

      {/* Featured battle 4: Saptari-4 */}
      <div className="pt-4 border-t-2 border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-8 bg-teal-500 rounded-full" />
          <h2 className="text-xl font-bold text-slate-800">सप्तरी-४ (Saptari-4)</h2>
          <span className="text-sm text-slate-500 font-medium">Sitaram Sah vs Teju Lal Chaudhary vs Wabi Singh</span>
        </div>
        {saptari4Loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : saptari4Data && saptari4Data.length > 0 ? (
          saptari4Data.map((c) => (
            <BattleCard key={c.constituency} electionData={c} />
          ))
        ) : null}
      </div>

      {/* Featured battle 5: Saptari-2 */}
      <div className="pt-4 border-t-2 border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-8 bg-rose-500 rounded-full" />
          <h2 className="text-xl font-bold text-slate-800">सप्तरी-२ (Saptari-2)</h2>
          <span className="text-sm text-slate-500 font-medium">Ramji Yadav vs Umesh Kumar Yadav vs Mohammad Ziaul Rahman vs Ram Kumar Yadav</span>
        </div>
        {saptari2Loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        ) : saptari2Data && saptari2Data.length > 0 ? (
          saptari2Data.map((c) => (
            <BattleCard key={c.constituency} electionData={c} />
          ))
        ) : null}
      </div>
    </section>
  );
};

export default HeroBattle;

