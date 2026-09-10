import React from "react";
import { TrendingUp, TrendingDown, Minus, Mic, MapPin, User, Wheat, Fish, Carrot, Egg, Apple, Flame, ShoppingBasket } from "lucide-react";
import { CATEGORY_META, UNIT_META } from "@/lib/locations";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

const ICONS = { rice: Wheat, fish: Fish, vegetables: Carrot, poultry: Egg, fruits: Apple, spices: Flame, other: ShoppingBasket };

export default function ProductCard({ product, onVoiceQuery, onCategoryClick }) {
  const cat = CATEGORY_META[product.category] || CATEGORY_META.other;
  const Icon = ICONS[product.category] || ShoppingBasket;
  const prev = product.previous_price || 0;
  const trend = prev > 0 ? (product.price > prev ? "up" : product.price < prev ? "down" : "stable") : "none";
  const changePct = prev > 0 ? Math.round(Math.abs((product.price - prev) / prev) * 100) : 0;

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-rose-600 bg-rose-50" : trend === "down" ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-100";

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all duration-200">
      <div className="relative aspect-[4/3] bg-slate-100">
        {product.image_url ? (
          <Image src={product.image_url} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `${cat.color}15` }}>
            <Icon className="w-16 h-16" style={{ color: cat.color }} strokeWidth={1.5} />
          </div>
        )}
        <button
          onClick={() => onCategoryClick?.(product.category)}
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur text-xs font-bold shadow-sm"
          style={{ color: cat.color }}
        >
          <Icon className="w-3.5 h-3.5" />
          {cat.label_bn}
        </button>
        {trend !== "none" && (
          <div className={cn("absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold", trendColor)}>
            <TrendIcon className="w-3 h-3" />
            {changePct}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-[1.25rem] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          {product.name_bn || product.name}
        </h3>
        {product.name_bn && product.name && (
          <p className="text-xs text-slate-400 mb-2">{product.name}</p>
        )}

        <div className="flex items-baseline gap-1.5 mb-3 mt-2">
          <span className="text-[1.75rem] font-bold text-slate-900 leading-none">৳{product.price}</span>
          <span className="text-sm text-slate-500 font-medium">/{UNIT_META[product.unit]?.label || "kg"}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate">{[product.village, product.union, product.upazila].filter(Boolean).join(", ")}</span>
        </div>
        {product.vendor_name && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{product.vendor_name}</span>
          </div>
        )}

        {onVoiceQuery && (
          <button
            onClick={() => onVoiceQuery(product)}
            className="lg:hidden w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition"
          >
            <Mic className="w-4 h-4" />
            Ask about this
          </button>
        )}
      </div>
    </div>
  );
}