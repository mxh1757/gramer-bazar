import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Trophy, MapPin, Wheat, Fish, Carrot, Egg, Apple, Flame, ShoppingBasket } from "lucide-react";
import { CATEGORY_META, UNIT_META } from "@/lib/locations";

const ICONS = { rice: Wheat, fish: Fish, vegetables: Carrot, poultry: Egg, fruits: Apple, spices: Flame, other: ShoppingBasket };

export default function MinRateVendors({ products }) {
  const best = useMemo(() => {
    const byCat = {};
    products.forEach(p => {
      if (!byCat[p.category]) byCat[p.category] = p;
      else if (p.price < byCat[p.category].price) byCat[p.category] = p;
    });
    return Object.keys(CATEGORY_META)
      .map(key => byCat[key])
      .filter(Boolean)
      .sort((a, b) => a.price - b.price);
  }, [products]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
          <Trophy className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Lowest Market Rates</h3>
          <p className="text-xs text-slate-500">সর্বনিম্ন দামের বিক্রেতা</p>
        </div>
      </div>

      {best.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-400">No vendor rates yet</div>
      ) : (
        <div className="space-y-2">
          {best.map(p => {
            const c = CATEGORY_META[p.category];
            const Icon = ICONS[p.category];
            const loc = [p.village, p.union, p.upazila].filter(Boolean).join(", ");
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0" style={{ background: `${c.color}15` }}>
                    {Icon && <Icon className="w-4 h-4" style={{ color: c.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{p.vendor_name || "Unknown vendor"}</p>
                    <p className="text-xs text-slate-400 truncate">{c.label_bn} · {loc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-700">৳{p.price}</p>
                    <p className="text-[11px] text-slate-400">/{UNIT_META[p.unit]?.label || "kg"}</p>
                  </div>
                </div>
              </>
            );
            return p.vendor_id ? (
              <Link key={p.id} to={`/vendor/${p.vendor_id}`} className="block p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition">
                {content}
              </Link>
            ) : (
              <div key={p.id} className="p-3 rounded-xl bg-white border border-slate-200">{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}