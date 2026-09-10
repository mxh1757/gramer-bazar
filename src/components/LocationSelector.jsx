import React, { useState } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";
import { DIVISIONS, getDistricts, getUpazilas, getUnions, getVillages } from "@/lib/locations";
import { cn } from "@/lib/utils";

export default function LocationSelector({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const { division, district, upazila, union, village } = value;

  const set = (patch) => {
    const next = { ...value, ...patch };
    if (patch.division !== undefined) { next.district = ""; next.upazila = ""; next.union = ""; next.village = ""; }
    if (patch.district !== undefined) { next.upazila = ""; next.union = ""; next.village = ""; }
    if (patch.upazila !== undefined) { next.union = ""; next.village = ""; }
    if (patch.union !== undefined) { next.village = ""; }
    onChange(next);
  };

  const districts = getDistricts(division);
  const upazilas = getUpazilas(division, district);
  const unions = getUnions(division, district, upazila);
  const villages = getVillages(division, district, upazila, union);

  const breadcrumb = [upazila, union, village].filter(Boolean).join(" › ") || district || division || "All Bangladesh";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-2 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold hover:border-emerald-400 transition",
          compact ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm"
        )}
      >
        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="max-w-[180px] truncate">{breadcrumb}</span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-2 w-[300px] sm:w-[340px] right-0 sm:left-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Select Location</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <Select label="Division" value={division} options={DIVISIONS} onChange={v => set({ division: v })} />
              <Select label="District" value={district} options={districts} placeholder="Select district" onChange={v => set({ district: v })} />
              <Select label="Upazila" value={upazila} options={upazilas} placeholder="Select upazila" onChange={v => set({ upazila: v })} />
              <Select label="Union" value={union} options={unions} placeholder="Select union" onChange={v => set({ union: v })} />
              <Select label="Village" value={village} options={villages} placeholder="Select village" onChange={v => set({ village: v })} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Select({ label, value, options, placeholder = "Select", onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}