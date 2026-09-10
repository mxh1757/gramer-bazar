import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Store, Camera, Search, TrendingUp, TrendingDown, Sun, Loader2, PackageOpen, X } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import LocationSelector from "@/components/LocationSelector";
import VoiceSearchButton from "@/components/VoiceSearchButton";
import OfflineBanner from "@/components/OfflineBanner";
import ProductCard from "@/components/ProductCard";
import CategoryFilter, { RadiusSelector } from "@/components/CategoryFilter";
import HatDaySchedule from "@/components/HatDaySchedule";
import PriceBoard from "@/components/PriceBoard";
import MinRateVendors from "@/components/MinRateVendors";
import PostProductSheet from "@/components/PostProductSheet";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { CATEGORY_META } from "@/lib/locations";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [hatDays, setHatDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ division: "", district: "", upazila: "", union: "", village: "" });
  const [radius, setRadius] = useState("upazila");
  const [category, setCategory] = useState("all");
  const [textQuery, setTextQuery] = useState("");
  const [postOpen, setPostOpen] = useState(false);

  const { isOnline, pendingCount, addToQueue, syncQueue, syncing } = useOfflineSync();
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, hats] = await Promise.all([
        base44.entities.Product.list("-created_date", 100),
        base44.entities.HatDay.list()
      ]);
      setProducts(prods);
      setHatDays(hats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onVoiceResult = useCallback((txt) => {
    setTextQuery(txt);
  }, []);

  const { listening, transcript, supported: voiceSupported, start, stop, reset } = useVoiceSearch({
    onResult: onVoiceResult,
    onError: (msg) => toast({ title: "Voice search", description: msg, variant: "destructive" })
  });

  const toggleVoice = () => {
    if (listening) { stop(); setTextQuery(""); reset(); return; }
    if (!voiceSupported) {
      toast({ title: "Voice search", description: "Voice search isn't supported in this browser. Use Chrome or Edge.", variant: "destructive" });
      return;
    }
    setTextQuery(""); start();
  };

  // Filter by location radius
  const locationFiltered = useMemo(() => {
    return products.filter(p => {
      if (location.division && p.division !== location.division) return false;
      if (location.district && p.district !== location.district) return false;
      if (radius === "district") return true;
      if (location.upazila && p.upazila !== location.upazila) return false;
      if (radius === "upazila") return true;
      if (location.union && p.union !== location.union) return false;
      if (radius === "union") return true;
      if (location.village && p.village !== location.village) return false;
      return true;
    });
  }, [products, location, radius]);

  const filtered = useMemo(() => {
    let list = locationFiltered;
    if (category !== "all") list = list.filter(p => p.category === category);
    const q = (textQuery || transcript || "").trim().toLowerCase();
    if (q) list = list.filter(p => {
      const cat = CATEGORY_META[p.category];
      return (p.name || "").toLowerCase().includes(q) ||
        (p.name_bn || "").toLowerCase().includes(q) ||
        (p.vendor_name || "").toLowerCase().includes(q) ||
        (cat?.label || "").toLowerCase().includes(q) ||
        (cat?.label_bn || "").includes(q);
    });
    return list;
  }, [locationFiltered, category, textQuery, transcript]);

  const locationLabel = [location.upazila, location.union, location.village].filter(Boolean).join(", ") || location.district || location.division || "All Bangladesh";

  // Hero summary
  const summary = useMemo(() => {
    if (locationFiltered.length === 0) return { count: 0, avg: 0, up: 0, down: 0 };
    const avg = locationFiltered.reduce((s, p) => s + p.price, 0) / locationFiltered.length;
    const up = locationFiltered.filter(p => p.previous_price && p.price > p.previous_price).length;
    const down = locationFiltered.filter(p => p.previous_price && p.price < p.previous_price).length;
    return { count: locationFiltered.length, avg, up, down };
  }, [locationFiltered]);

  const heroCarouselItems = useMemo(() => {
    return locationFiltered.slice(0, 5);
  }, [locationFiltered]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-0">
      {/* ===== TOP NAV (desktop) ===== */}
      <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between gap-4 px-6 py-3 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>হাটবাজার</span>
          </div>
          <span className="text-slate-300">|</span>
          <LocationSelector value={location} onChange={setLocation} />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={textQuery}
              onChange={e => setTextQuery(e.target.value)}
              placeholder="Search crops, fish, vendors…"
              className="w-64 h-11 pl-10 pr-4 rounded-full bg-slate-100 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
          <VoiceSearchButton listening={listening} onToggle={toggleVoice} size="pill" />
          <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} syncing={syncing} onSync={syncQueue} />
          <Link to="/my-shop" className="flex items-center gap-2 h-11 px-4 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:border-emerald-400 hover:text-emerald-700 transition">
            <Store className="w-4 h-4" /> My Shop
          </Link>
          <button
            onClick={() => setPostOpen(true)}
            className="flex items-center gap-2 h-11 px-5 rounded-full bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Post My Product
          </button>
        </div>
      </header>

      {/* ===== TOP BAR (mobile) ===== */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <LocationSelector value={location} onChange={setLocation} compact />
          </div>
          <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} syncing={syncing} onSync={syncQueue} />
        </div>
        {listening && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 h-11 px-3 rounded-full bg-rose-50 border border-rose-200">
              <span className="flex gap-0.5 items-end h-4">
                <span className="w-1 bg-rose-500 rounded-full voice-bar" style={{ height: "100%" }} />
                <span className="w-1 bg-rose-500 rounded-full voice-bar" style={{ height: "100%", animationDelay: "0.15s" }} />
                <span className="w-1 bg-rose-500 rounded-full voice-bar" style={{ height: "100%", animationDelay: "0.3s" }} />
              </span>
              <span className="text-sm font-semibold text-rose-700 truncate">{transcript || "Listening… speak now"}</span>
            </div>
          </div>
        )}
        {textQuery && !listening && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 h-10 px-3 rounded-full bg-slate-100">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm text-slate-700 flex-1 truncate">{textQuery}</span>
              <button onClick={() => setTextQuery("")}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ARRIVAL ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative px-4 sm:px-6 lg:px-12 py-8 lg:py-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-5 h-5 text-amber-300" />
                  <span className="text-sm font-semibold text-emerald-100">Today's Market · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
                </div>
                <h1 className="font-bold leading-[1.05] text-balance" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                  {location.village || location.union || location.upazila || "Your Local"} Market Prices
                </h1>
                <p className="mt-3 text-emerald-100 text-base lg:text-lg max-w-xl">
                  See what your neighbours are selling today. Track prices, find the nearest hat day, and post your own produce.
                </p>
              </div>

              {/* Summary stats */}
              <div className="flex gap-3 lg:gap-4">
                <StatCard label="Listings" value={summary.count} />
                <StatCard label="Avg Price" value={`৳${Math.round(summary.avg)}`} />
                <StatCard label="Rising" value={summary.up} icon={<TrendingUp className="w-3.5 h-3.5" />} accent="text-amber-300" />
                <StatCard label="Falling" value={summary.down} icon={<TrendingDown className="w-3.5 h-3.5" />} accent="text-emerald-300" />
              </div>
            </div>

            {/* Mobile visual search bar */}
            <div className="lg:hidden mt-6">
              <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={textQuery}
                    onChange={e => setTextQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50 text-sm focus:outline-none"
                  />
                </div>
                <VoiceSearchButton listening={listening} onToggle={toggleVoice} />
              </div>
              {!voiceSupported && (
                <p className="text-xs text-emerald-100/70 mt-2 text-center">Voice search works best on Chrome/Edge.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE HERO CAROUSEL (today's prices) ===== */}
      {heroCarouselItems.length > 0 && (
        <section className="lg:hidden px-4 -mt-4">
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {heroCarouselItems.map(p => (
              <div key={p.id} className="snap-start shrink-0 w-64 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="relative h-32 bg-slate-100">
                  {p.image_url ? <Image src={p.image_url} fittingType="fill" className="w-full h-full" /> : <div className="w-full h-full bg-emerald-50" />}
                </div>
                <div className="p-3">
                  <p className="font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{p.name_bn || p.name}</p>
                  <p className="text-2xl font-bold text-emerald-700">৳{p.price}<span className="text-sm text-slate-400 font-normal">/{p.unit}</span></p>
                  <p className="text-xs text-slate-500 truncate">{p.village || p.union || p.upazila}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== FILTER CHIPS (mobile/tablet, pinned under header) ===== */}
      <div className="lg:hidden px-4 py-2.5 sticky top-[53px] z-20 bg-slate-50/95 backdrop-blur space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {["village", "union", "upazila", "district"].map(r => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border-2 capitalize transition",
                radius === r ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="px-4 sm:px-6 lg:px-12 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-6">
          {/* LEFT RAIL (desktop) */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <RadiusSelector radius={radius} onChange={setRadius} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <HatDaySchedule hatDays={hatDays.filter(h => !location.upazila || h.upazila === location.upazila)} locationLabel={locationLabel} />
            </div>
          </aside>

          {/* CENTER — product feed */}
          <div className="min-w-0">
            <div className="hidden lg:flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                {category === "all" ? "All Products" : "Filtered"} · {filtered.length}
              </h2>
              <CategoryFilter active={category} onChange={setCategory} />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Loading market prices…</p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState onPost={() => setPostOpen(true)} hasLocation={!!location.upazila} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} onCategoryClick={setCategory} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT RAIL (desktop) */}
          <aside className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-24 space-y-5">
              <PriceBoard products={locationFiltered} />
              <div className="border-t border-slate-100 pt-4">
                <MinRateVendors products={locationFiltered} />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ===== MOBILE BOTTOM STICKY BAR ===== */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          <Link to="/my-shop" className="flex flex-col items-center gap-0.5 text-slate-500">
            <Store className="w-6 h-6" />
            <span className="text-[10px] font-semibold">My Shop</span>
          </Link>
          <VoiceSearchButton listening={listening} onToggle={toggleVoice} size="large" />
          <button onClick={() => setPostOpen(true)} className="flex flex-col items-center gap-0.5 text-emerald-600">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center -mt-4 shadow-lg ring-4 ring-white">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-semibold">Post</span>
          </button>
        </div>
      </nav>

      <PostProductSheet
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onPosted={load}
        defaultLocation={location}
        offline={!isOnline}
        addToQueue={addToQueue}
      />
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 min-w-[80px]">
      <div className={cn("flex items-center gap-1 text-xs font-semibold text-emerald-100 mb-1", accent)}>
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
    </div>
  );
}

function EmptyState({ onPost, hasLocation }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <PackageOpen className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">No products here yet</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-4">
        {hasLocation ? "Be the first vendor in this area to post a price." : "Select your location to see local market prices."}
      </p>
      <button onClick={onPost} className="flex items-center gap-2 h-12 px-6 rounded-full bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition">
        <Plus className="w-4 h-4" /> Post My Product
      </button>
    </div>
  );
}