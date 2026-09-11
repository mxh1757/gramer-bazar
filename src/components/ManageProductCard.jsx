import React, { useState } from "react";
import { Trash2, Check, Loader2, X, Pencil, Wheat, Fish, Carrot, Egg, Apple, Flame, ShoppingBasket } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { CATEGORY_META, UNIT_META } from "@/lib/locations";
import { cn } from "@/lib/utils";

const ICONS = { rice: Wheat, fish: Fish, vegetables: Carrot, poultry: Egg, fruits: Apple, spices: Flame, other: ShoppingBasket };

export default function ManageProductCard({ product, onUpdated, onDeleted }) {
  const cat = CATEGORY_META[product.category] || CATEGORY_META.other;
  const Icon = ICONS[product.category] || ShoppingBasket;
  const [price, setPrice] = useState(String(product.price ?? ""));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const dirty = price !== String(product.price ?? "") && price !== "" && Number(price) >= 0;

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      await base44.entities.Product.update(product.id, {
        price: Number(price),
        previous_price: product.price
      });
      setEditing(false);
      onUpdated?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setPrice(String(product.price ?? ""));
    setEditing(false);
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await base44.entities.Product.delete(product.id);
      onDeleted?.();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-300 transition">
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          {product.image_url ? (
            <Image src={product.image_url} fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `${cat.color}15` }}>
              <Icon className="w-8 h-8" style={{ color: cat.color }} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 leading-tight truncate" style={{ fontFamily: "var(--font-display)" }}>
                {product.name_bn || product.name}
              </h3>
              {product.name_bn && product.name && (
                <p className="text-xs text-slate-400 truncate">{product.name}</p>
              )}
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ color: cat.color, background: `${cat.color}15` }}>
              <Icon className="w-3 h-3" /> {cat.label_bn}
            </span>
          </div>

          {/* Price row */}
          <div className="mt-2 flex items-center gap-2">
            {editing ? (
              <>
                <div className="flex items-center rounded-xl border border-emerald-300 bg-emerald-50/50 overflow-hidden">
                  <span className="pl-2.5 text-slate-500 font-bold">৳</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-20 h-9 px-2 bg-transparent text-sm font-bold focus:outline-none"
                    autoFocus
                  />
                  <span className="pr-2 text-xs text-slate-400">/{UNIT_META[product.unit]?.label || "kg"}</span>
                </div>
                <button onClick={save} disabled={!dirty || saving} className={cn("flex items-center justify-center w-9 h-9 rounded-xl transition", dirty && !saving ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-100 text-slate-300")}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={cancel} disabled={saving} className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-slate-900 leading-none">৳{product.price}</span>
                <span className="text-xs text-slate-400 font-medium">/{UNIT_META[product.unit]?.label || "kg"}</span>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 ml-auto h-8 px-2.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition">
                  <Pencil className="w-3 h-3" /> Price
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete bar */}
      <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-end bg-slate-50/60">
        {confirmDel ? (
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-slate-500 flex-1">Delete this listing?</span>
            <button onClick={doDelete} disabled={deleting} className="flex items-center gap-1 h-8 px-3 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
            </button>
            <button onClick={() => setConfirmDel(false)} disabled={deleting} className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDel(true)} className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-600 transition">
            <Trash2 className="w-3.5 h-3.5" /> Remove listing
          </button>
        )}
      </div>
    </div>
  );
}