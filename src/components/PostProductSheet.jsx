import React, { useState } from "react";
import { Camera, X, Loader2, Check, Wheat, Fish, Carrot, Egg, Apple, Flame, ShoppingBasket } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { CATEGORY_META, UNIT_META, DIVISIONS, getDistricts, getUpazilas, getUnions, getVillages } from "@/lib/locations";
import { cn } from "@/lib/utils";

const ICONS = { rice: Wheat, fish: Fish, vegetables: Carrot, poultry: Egg, fruits: Apple, spices: Flame, other: ShoppingBasket };

export default function PostProductSheet({ open, onClose, onPosted, defaultLocation, offline, addToQueue }) {
  const isMobile = useIsMobile();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(() => ({
    name: "", name_bn: "", category: "rice", price: "", unit: "kg", image_url: "",
    vendor_name: "", vendor_phone: "", notes: "",
    division: defaultLocation?.division || "", district: defaultLocation?.district || "",
    upazila: defaultLocation?.upazila || "", union: defaultLocation?.union || "", village: defaultLocation?.village || ""
  }));

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      set("image_url", file_url);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.name || !form.price || !form.upazila) return;
    setSubmitting(true);
    const payload = {
      ...form,
      price: Number(form.price),
      previous_price: 0,
      is_offline_queued: false
    };
    try {
      if (offline) {
        addToQueue(payload);
      } else {
        await base44.entities.Product.create(payload);
      }
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); onPosted?.(); }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = form.name && form.price && form.upazila && !uploading;

  const inner = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
        {/* Category icon grid */}
        <div>
          <Label className="text-sm font-bold text-slate-700 mb-2 block">Category</Label>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(CATEGORY_META).map(key => {
              const c = CATEGORY_META[key];
              const Icon = ICONS[key];
              const isActive = form.category === key;
              return (
                <button
                  key={key}
                  onClick={() => set("category", key)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition",
                    isActive ? "text-white border-transparent" : "bg-white text-slate-600 border-slate-200"
                  )}
                  style={isActive ? { backgroundColor: c.color, borderColor: c.color } : {}}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                  <span className="text-xs font-bold">{c.label_bn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Image upload */}
        <div>
          <Label className="text-sm font-bold text-slate-700 mb-2 block">Product Photo</Label>
          <label className="block">
            <div className={cn(
              "relative flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed cursor-pointer transition",
              form.image_url ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-emerald-400"
            )}>
              {form.image_url ? (
                <img src={form.image_url} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
              ) : uploading ? (
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-sm font-semibold text-slate-500">Tap to take/upload photo</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleImage(e.target.files?.[0])} />
          </label>
        </div>

        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-bold text-slate-700 mb-1.5 block">Product Name</Label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Rice" className="h-12" />
          </div>
          <div>
            <Label className="text-sm font-bold text-slate-700 mb-1.5 block">নাম (Bengali)</Label>
            <Input value={form.name_bn} onChange={e => set("name_bn", e.target.value)} placeholder="যেমন চাল" className="h-12" style={{ fontFamily: "var(--font-display)" }} />
          </div>
        </div>

        {/* Price + unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-bold text-slate-700 mb-1.5 block">Price (৳)</Label>
            <Input type="number" inputMode="numeric" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0" className="h-12 text-lg font-bold" />
          </div>
          <div>
            <Label className="text-sm font-bold text-slate-700 mb-1.5 block">Unit</Label>
            <select value={form.unit} onChange={e => set("unit", e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium">
              {Object.keys(UNIT_META).map(u => <option key={u} value={u}>{UNIT_META[u].label} · {UNIT_META[u].label_bn}</option>)}
            </select>
          </div>
        </div>

        {/* Vendor */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-bold text-slate-700 mb-1.5 block">Vendor Name</Label>
            <Input value={form.vendor_name} onChange={e => set("vendor_name", e.target.value)} placeholder="Your name/shop" className="h-12" />
          </div>
          <div>
            <Label className="text-sm font-bold text-slate-700 mb-1.5 block">Phone</Label>
            <Input value={form.vendor_phone} onChange={e => set("vendor_phone", e.target.value)} placeholder="01XXXXXXXXX" className="h-12" />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label className="text-sm font-bold text-slate-700 mb-2 block">Location</Label>
          <div className="grid grid-cols-2 gap-2">
            <LocSelect label="Division" value={form.division} options={DIVISIONS} onChange={v => setLoc(setForm, "division", v)} />
            <LocSelect label="District" value={form.district} options={getDistricts(form.division)} onChange={v => setLoc(setForm, "district", v)} />
            <LocSelect label="Upazila" value={form.upazila} options={getUpazilas(form.division, form.district)} onChange={v => setLoc(setForm, "upazila", v)} />
            <LocSelect label="Union" value={form.union} options={getUnions(form.division, form.district, form.upazila)} onChange={v => set("union", v)} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label className="text-sm font-bold text-slate-700 mb-1.5 block">Update / Notes</Label>
          <Input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Fresh today, organic…" className="h-12" />
        </div>

        {offline && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            You're offline — this will be saved and synced automatically when you reconnect.
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4 bg-white">
        <Button
          onClick={submit}
          disabled={!canSubmit || submitting || done}
          className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700"
        >
          {done ? <><Check className="w-5 h-5 mr-2" /> Posted!</> : submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Post My Product"}
        </Button>
      </div>
    </div>
  );

  const setLoc = (setter, field, val) => {
    setter(f => {
      const next = { ...f, [field]: val };
      if (field === "division") { next.district = ""; next.upazila = ""; next.union = ""; next.village = ""; }
      if (field === "district") { next.upazila = ""; next.union = ""; next.village = ""; }
      if (field === "upazila") { next.union = ""; next.village = ""; }
      return next;
    });
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={o => !o && onClose()}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-lg font-bold">Post Your Product</DrawerTitle>
            <DrawerDescription>Share your price with the local market</DrawerDescription>
          </DrawerHeader>
          {inner}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-lg font-bold">Post Your Product</SheetTitle>
          <SheetDescription>Share your price with the local market</SheetDescription>
        </SheetHeader>
        {inner}
      </SheetContent>
    </Sheet>
  );
}

function LocSelect({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium">
        <option value="">Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}