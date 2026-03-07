import { useQuery } from "@tanstack/react-query";
import {
  fetchProvinces,
  fetchDistricts,
  fetchConstituencyCounts,
  fetchECElectionData,
  type ECProvince,
  type ECDistrict,
  type ECConstituencyCount,
} from "@/services/ecElectionApi";

const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL) || 30000;

/** Provinces / states */
export function useProvinces() {
  return useQuery({
    queryKey: ["ec-provinces"],
    queryFn: fetchProvinces,
    staleTime: Infinity,
  });
}

/** All districts (filtered client-side by province) */
export function useDistricts(provinceId?: number) {
  return useQuery({
    queryKey: ["ec-districts", provinceId],
    queryFn: async () => {
      const all = await fetchDistricts();
      return provinceId ? all.filter((d) => d.parentId === provinceId) : all;
    },
    staleTime: Infinity,
    enabled: true,
  });
}

/** Constituency counts for a district */
export function useConstituencies(distId?: number) {
  return useQuery({
    queryKey: ["ec-constituencies", distId],
    queryFn: async () => {
      const all = await fetchConstituencyCounts();
      if (!distId) return [];
      const entry = all.find((c) => c.distId === distId);
      if (!entry) return [];
      // Build array [1, 2, ..., n]
      return Array.from({ length: entry.consts }, (_, i) => i + 1);
    },
    staleTime: Infinity,
    enabled: !!distId,
  });
}

/** Election results */
export function useECElectionData(distId?: number, constId?: number) {
  return useQuery({
    queryKey: ["ec-election-data", distId, constId],
    queryFn: () => fetchECElectionData(distId!, constId!),
    enabled: !!distId && !!constId,
    refetchInterval: POLLING_INTERVAL,
    staleTime: 10000,
    gcTime: 300000,
    retry: 3,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
}
