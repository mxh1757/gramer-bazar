import React from "react";
import { LayoutGrid, Home, Building2, Map, Globe2, Wheat, Fish, Carrot, Egg, Apple, Flame, ShoppingBasket } from "lucide-react";
import { CATEGORY_META } from "@/lib/locations";
import { cn } from "@/lib/utils";

const ICONS = { rice: Wheat, fish: Fish, vegetables: Carrot, poultry: Egg, fruits: Apple, spices: Flame, other: ShoppingBasket };

export default function CategoryFilter({ active, onChange }) {
  const cats = Object.keys(CATEGORY_META);
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      <button
        onClick={() => onChange("all")}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border-2",
          active === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        All
      </button>
      {cats.map(key => {
        const c = CATEGORY_META[key];
        const Icon = ICONS[key];
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border-2",
              active === key ? "text-white border-transparent" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            )}
            style={active === key ? { backgroundColor: c.color, borderColor: c.color } : {}}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{c.label_bn}</span>
          </button>
        );
      })}
    </div>
  );
}

export function RadiusSelector({ radius, onChange }) {
  const levels = [
    { key: "village", label: "Village", label_bn: "গ্রাম", icon: Home },
    { key: "union", label: "Union", label_bn: "ইউনিয়ন", icon: Building2 },
    { key: "upazila", label: "Upazila", label_bn: "উপজেলা", icon: Map },
    { key: "district", label: "District", label_bn: "জেলা", icon: Globe2 }
  ];
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Hyper-local radius</p>
      <div className="grid grid-cols-2 gap-2">
        {levels.map(l => {
          const Icon = l.icon;
          const isActive = radius === l.key;
          return (
            <button
              key={l.key}
              onClick={() => onChange(l.key)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition",
                isActive ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-bold">{l.label}</span>
              <span className="text-xs opacity-80">{l.label_bn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}