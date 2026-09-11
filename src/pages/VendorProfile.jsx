import React, { useState, useEffect } from "react";
import { MapPin, Phone, Store, Pencil, ArrowLeft, Package, Sun, BadgeCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { CATEGORY_META } from "@/lib/locations";
import ProductCard from "@/components/ProductCard";
import VendorFormSheet from "@/components/VendorFormSheet";
import { useAuth } from "@/lib/AuthContext";

export default function VendorProfile() {
  const id = window.location.pathname.split("/")[2];
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const v = await base44.entities.Vendor.get(id);
      setVendor(v);
      let prods = [];
      try {
        prods = await base44.entities.Product.filter({ vendor_id: id }, "-created_date", 100);
      } catch (e) {}
      if (prods.length === 0 && v.shop_name) {
        try {
          prods = await base44.entities.Product.filter({ vendor_name: v.shop_name }, "-created_date", 100);
        } catch (e) {}
      }
      setProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { if (id) load(); }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>;
  if (!vendor) return <div className="min-h-screen flex flex-col items-center justify-center gap-3"><p className="text-slate-500">Vendor not found.</p><Link to="/" className="text-emerald-600 font-semibold">Go home</Link></div>;

  const isOwner = user && vendor.owner_user_id === user.id;
  const specs = vendor.specialties ? vendor.specialties.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Banner */}
      <div className="relative h-44 sm:h-56 bg-gradient-to-br from-emerald-600 to-slate-900">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-5xl mx-auto px-4 h-full flex items-center">
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-white text-sm font-semibold hover:bg-white/25 transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16">
        {/* Shop header card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-emerald-100 shrink-0 -mt-12 sm:-mt-14 border-4 border-white shadow">
              {vendor.photo_url ? <Image src={vendor.photo_url} fittingType="fill" className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center"><Store className="w-10 h-10 text-emerald-600" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{vendor.shop_name_bn || vendor.shop_name}</h1>
                {vendor.contact_verified && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full"><BadgeCheck className="w-3.5 h-3.5" /> Verified</span>}
              </div>
              {vendor.shop_name_bn && vendor.shop_name && <p className="text-sm text-slate-400">{vendor.shop_name}</p>}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-600" />{[vendor.village, vendor.union, vendor.upazila].filter(Boolean).join(", ")}</span>
                {vendor.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-slate-400" />{vendor.phone}</span>}
                {vendor.hat_day && <span className="flex items-center gap-1"><Sun className="w-4 h-4 text-amber-500" />{vendor.hat_day}</span>}
              </div>
            </div>
            {isOwner && (
              <button onClick={() => setEditOpen(true)} className="flex items-center gap-2 h-11 px-4 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition shrink-0">
                <Pencil className="w-4 h-4" /> Edit Shop
              </button>
            )}
          </div>

          {vendor.description && <p className="mt-4 text-sm text-slate-600 leading-relaxed">{vendor.description}</p>}
          {specs.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {specs.map(s => {
                const c = CATEGORY_META[s];
                return <span key={s} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: c ? `${c.color}15` : "#f1f5f9", color: c ? c.color : "#475569" }}>{c ? c.label_bn : s}</span>;
              })}
            </div>
          )}
        </div>

        {/* Listings */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Package className="w-5 h-5 text-emerald-600" /> {products.length} Listings</h2>
            {isOwner && (
              <Link to="/my-shop" className="text-sm font-semibold text-emerald-600 hover:underline">Post new product →</Link>
            )}
          </div>
          {products.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No products posted yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} onCategoryClick={() => {}} />)}
            </div>
          )}
        </div>
      </div>

      {isOwner && (
        <VendorFormSheet open={editOpen} onClose={() => setEditOpen(false)} onSaved={load} existing={vendor} />
      )}
    </div>
  );
}