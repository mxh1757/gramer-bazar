import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart3, Wheat, Fish, Carrot, Egg, Apple, Flame, ShoppingBasket } from "lucide-react";
import { CATEGORY_META } from "@/lib/locations";
import { cn } from "@/lib/utils";

const ICONS = { rice: Wheat, fish: Fish, vegetables: Carrot, poultry: Egg, fruits: Apple, spices: Flame, other: ShoppingBasket };

export default function PriceBoard({ products }) {
  const stats = useMemo(() => {
    const byCat = {};
    products.forEach(p => {
      if (!byCat[p.category]) byCat[p.category] = [];
      byCat[p.category].push(p);
    });
    return Object.keys(CATEGORY_META).map(key => {
      const items = byCat[key] || [];
      if (items.length === 0) return null;
      const avg = items.reduce((s, p) => s + p.price, 0) / items.length;
      const prevAvg = items.reduce((s, p) => s + (p.previous_price || p.price), 0) / items.length;
      const change = prevAvg > 0 ? ((avg - prevAvg) / prevAvg) * 100 : 0;
      return { key, avg, change, count: items.length };
    }).filter(Boolean);
  }, [products]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Price Tracking Board</h3>
          <p className="text-xs text-slate-500">Today vs yesterday</p>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-400">No price data yet</div>
      ) : (
        <div className="space-y-2">
          {stats.map(s => {
            const c = CATEGORY_META[s.key];
            const Icon = ICONS[s.key];
            const up = s.change > 1;
            const down = s.change < -1;
            const TrendIcon = up ? TrendingUp : down ? TrendingDown : Minus;
            const color = up ? "text-rose-600" : down ? "text-emerald-600" : "text-slate-500";
            return (
              <div key={s.key} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0" style={{ background: `${c.color}15` }}>
                  {Icon && <Icon className="w-4 h-4" style={{ color: c.color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900">{c.label_bn}</p>
                  <p className="text-xs text-slate-400">{s.count} listings</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">৳{Math.round(s.avg)}</p>
                  <div className={cn("flex items-center justify-end gap-0.5 text-xs font-semibold", color)}>
                    <TrendIcon className="w-3 h-3" />
                    {Math.abs(s.change).toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}