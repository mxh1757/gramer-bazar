import React, { useState, useEffect } from "react";
import { Camera, Loader2, Check, Store, Wheat, Fish, Carrot, Egg, Apple, Flame, ShoppingBasket, ShieldCheck, BadgeCheck, Phone, Mail, KeyRound } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { CATEGORY_META, DAY_NAMES, DIVISIONS, getDistricts, getUpazilas, getUnions } from "@/lib/locations";
import { cn } from "@/lib/utils";

const ICONS = { rice: Wheat, fish: Fish, vegetables: Carrot, poultry: Egg, fruits: Apple, spices: Flame, other: ShoppingBasket };

export default function VendorFormSheet({ open, onClose, onSaved, existing = null, defaultLocation = {} }) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(() => existing ? {
    shop_name: existing.shop_name || "", shop_name_bn: existing.shop_name_bn || "",
    owner_name: existing.owner_name || "", phone: existing.phone || "", email: existing.email || "", photo_url: existing.photo_url || "",
    division: existing.division || "", district: existing.district || "", upazila: existing.upazila || "",
    union: existing.union || "", village: existing.village || "", description: existing.description || "",
    specialties: existing.specialties || "", hat_day: existing.hat_day || ""
  } : {
    shop_name: "", shop_name_bn: "", owner_name: "", phone: "", email: user?.email || "", photo_url: "",
    division: defaultLocation.division || "", district: defaultLocation.district || "",
    upazila: defaultLocation.upazila || "", union: defaultLocation.union || "", village: defaultLocation.village || "",
    description: "", specialties: "", hat_day: ""
  });
  const [selectedCats, setSelectedCats] = useState(() =>
    existing?.specialties ? existing.specialties.split(",").map(s => s.trim()).filter(Boolean) : []
  );
  const [verifyChannel, setVerifyChannel] = useState(() => (existing?.contact_verified && existing.email && !existing.phone) ? "email" : "phone");
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [devCode, setDevCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [verifiedContact, setVerifiedContact] = useState(() => {
    if (existing?.contact_verified) {
      if (existing.phone) return { channel: "phone", value: existing.phone };
      if (existing.email) return { channel: "email", value: existing.email };
    }
    return null;
  });

  const currentContact = verifyChannel === "phone" ? form.phone : form.email;
  const isVerified = !!verifiedContact && verifiedContact.channel === verifyChannel && verifiedContact.value === currentContact;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (verifiedContact && verifiedContact.value !== currentContact) {
      setVerifiedContact(null); setOtpSent(false); setOtpCode(""); setDevCode(""); setOtpError("");
    }
  }, [currentContact, verifiedContact]);

  const resetOtp = () => { setOtpSent(false); setOtpCode(""); setOtpError(""); setDevCode(""); setVerifiedContact(null); };

  const sendOtp = async () => {
    setOtpError("");
    if (!currentContact) { setOtpError(verifyChannel === "phone" ? "Enter your phone number first." : "Enter your email first."); return; }
    setOtpSending(true);
    try {
      const res = await base44.functions.invoke("sendShopOtp", { channel: verifyChannel, value: currentContact });
      const d = res.data || {};
      setOtpSent(true); setDevCode(d.dev_code || ""); setOtpCode(""); setVerifiedContact(null); setResendIn(30);
    } catch (e) {
      setOtpError(e?.response?.data?.error || e?.message || "Could not send code. Try again.");
    } finally { setOtpSending(false); }
  };

  const verifyOtp = async () => {
    setOtpError("");
    if (otpCode.length !== 6) { setOtpError("Enter the 6-digit code."); return; }
    setOtpVerifying(true);
    try {
      await base44.functions.invoke("verifyShopOtp", { channel: verifyChannel, value: currentContact, code: otpCode });
      setVerifiedContact({ channel: verifyChannel, value: currentContact });
      setDevCode("");
    } catch (e) {
      setOtpError(e?.response?.data?.error || e?.message || "Verification failed.");
    } finally { setOtpVerifying(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setLoc = (field, val) => {
    setForm(f => {
      const next = { ...f, [field]: val };
      if (field === "division") { next.district = ""; next.upazila = ""; next.union = ""; next.village = ""; }
      if (field === "district") { next.upazila = ""; next.union = ""; next.village = ""; }
      if (field === "upazila") { next.union = ""; next.village = ""; }
      return next;
    });
  };

  const toggleCat = (key) => {
    setSelectedCats(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      set("photo_url", file_url);
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const submit = async () => {
    if (!form.shop_name || !form.owner_name || !form.upazila) return;
    if (!existing && !isVerified) return;
    setSubmitting(true);
    const contactVerified = existing ? (isVerified || existing.contact_verified || false) : true;
    const payload = { ...form, specialties: selectedCats.join(", "), contact_verified: contactVerified };
    try {
      if (existing) await base44.entities.Vendor.update(existing.id, payload);
      else await base44.entities.Vendor.create({ ...payload, owner_user_id: user?.id });
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); onSaved?.(); }, 1000);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const canSubmit = form.shop_name && form.owner_name && form.upazila && !uploading && (existing ? true : isVerified);

  const inner = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
        {/* Photo */}
        <div>
          <Label className="text-sm font-bold text-slate-700 mb-2 block">Shop Photo</Label>
          <label className="block">
            <div className={cn("relative flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed cursor-pointer transition",
              form.photo_url ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-emerald-400")}>
              {form.photo_url ? <img src={form.photo_url} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                : uploading ? <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                : <><Camera className="w-8 h-8 text-slate-400 mb-1" /><span className="text-sm font-semibold text-slate-500">Add shop photo</span></>}
            </div>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleImage(e.target.files?.[0])} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-sm font-bold text-slate-700 mb-1.5 block">Shop Name</Label><Input value={form.shop_name} onChange={e => set("shop_name", e.target.value)} placeholder="Karim Store" className="h-12" /></div>
          <div><Label className="text-sm font-bold text-slate-700 mb-1.5 block">দোকানের নাম</Label><Input value={form.shop_name_bn} onChange={e => set("shop_name_bn", e.target.value)} placeholder="করিম স্টোর" className="h-12" style={{ fontFamily: "var(--font-display)" }} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-sm font-bold text-slate-700 mb-1.5 block">Owner Name</Label><Input value={form.owner_name} onChange={e => set("owner_name", e.target.value)} placeholder="Your name" className="h-12" /></div>
          <div><Label className="text-sm font-bold text-slate-700 mb-1.5 block">Phone</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="01XXXXXXXXX" className="h-12" inputMode="tel" /></div>
        </div>
        <div>
          <Label className="text-sm font-bold text-slate-700 mb-1.5 block">Email</Label>
          <Input value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" className="h-12" inputMode="email" />
        </div>

        {/* Contact verification */}
        <div className="rounded-2xl border-2 border-slate-200 p-4 bg-slate-50/60">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-700">Verify your contact</span>
            {isVerified && <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full"><BadgeCheck className="w-3.5 h-3.5" /> Verified</span>}
          </div>
          <div className="flex gap-2 mb-3">
            {["phone", "email"].map(ch => (
              <button key={ch} type="button" onClick={() => { setVerifyChannel(ch); resetOtp(); }}
                className={cn("flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-bold border-2 capitalize transition",
                  verifyChannel === ch ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300")}>
                {ch === "phone" ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />} {ch}
              </button>
            ))}
          </div>
          {!isVerified && (
            <>
              {!otpSent ? (
                <button type="button" onClick={sendOtp} disabled={otpSending || !currentContact}
                  className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                  {otpSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Send code {currentContact ? `to ${currentContact}` : ""}
                </button>
              ) : (
                <div className="space-y-2">
                  {devCode && (
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                      <span>Demo mode (no SMS connected) — your code:</span>
                      <span className="font-mono text-base tracking-widest text-amber-900">{devCode}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" className="h-11 text-center text-lg tracking-widest font-bold" inputMode="numeric" />
                    <button type="button" onClick={verifyOtp} disabled={otpVerifying || otpCode.length !== 6}
                      className="h-11 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-2 shrink-0">
                      {otpVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Verify
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <button type="button" onClick={sendOtp} disabled={resendIn > 0 || otpSending}
                      className="font-semibold text-emerald-700 hover:underline disabled:opacity-40 disabled:no-underline">
                      {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                    </button>
                    <button type="button" onClick={resetOtp} className="font-semibold text-slate-500 hover:text-slate-700">Edit contact</button>
                  </div>
                </div>
              )}
              {otpError && <p className="text-xs font-semibold text-rose-600 mt-2">{otpError}</p>}
            </>
          )}
          {!existing && !isVerified && <p className="text-xs text-slate-500 mt-3">Verify your phone or email to publish your shop.</p>}
        </div>

        {/* Specialties */}
        <div>
          <Label className="text-sm font-bold text-slate-700 mb-2 block">What do you sell?</Label>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(CATEGORY_META).map(key => {
              const c = CATEGORY_META[key]; const Icon = ICONS[key];
              const isActive = selectedCats.includes(key);
              return (
                <button key={key} onClick={() => toggleCat(key)} type="button"
                  className={cn("flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition", isActive ? "text-white border-transparent" : "bg-white text-slate-600 border-slate-200")}
                  style={isActive ? { backgroundColor: c.color, borderColor: c.color } : {}}>
                  {Icon && <Icon className="w-5 h-5" />}
                  <span className="text-xs font-bold">{c.label_bn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <Label className="text-sm font-bold text-slate-700 mb-2 block">Location</Label>
          <div className="grid grid-cols-2 gap-2">
            <LocSelect label="Division" value={form.division} options={DIVISIONS} onChange={v => setLoc("division", v)} />
            <LocSelect label="District" value={form.district} options={getDistricts(form.division)} onChange={v => setLoc("district", v)} />
            <LocSelect label="Upazila" value={form.upazila} options={getUpazilas(form.division, form.district)} onChange={v => setLoc("upazila", v)} />
            <LocSelect label="Union" value={form.union} options={getUnions(form.division, form.district, form.upazila)} onChange={v => set("union", v)} />
          </div>
        </div>

        {/* Hat day */}
        <div>
          <Label className="text-sm font-bold text-slate-700 mb-1.5 block">Regular Hat Day</Label>
          <select value={form.hat_day || ""} onChange={e => set("hat_day", e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium">
            <option value="">None</option>
            {DAY_NAMES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <Label className="text-sm font-bold text-slate-700 mb-1.5 block">About your shop</Label>
          <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="What you sell, since when…" className="h-12" />
        </div>
      </div>

      <div className="border-t border-slate-100 p-4 bg-white">
        <Button onClick={submit} disabled={!canSubmit || submitting || done} className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700">
          {done ? <><Check className="w-5 h-5 mr-2" /> Saved!</> : submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : existing ? "Save Changes" : "Create My Shop"}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={o => !o && onClose()}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="pb-2"><DrawerTitle className="text-lg font-bold">{existing ? "Edit Shop" : "Create Your Shop"}</DrawerTitle><DrawerDescription>Set up your vendor profile</DrawerDescription></DrawerHeader>
          {inner}
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-2"><SheetTitle className="text-lg font-bold">{existing ? "Edit Shop" : "Create Your Shop"}</SheetTitle><SheetDescription>Set up your vendor profile</SheetDescription></SheetHeader>
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