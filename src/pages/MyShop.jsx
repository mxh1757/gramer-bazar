import React, { useState, useEffect } from "react";
import { Store, Plus, Pencil, Package, ArrowLeft, PackageOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import ProductCard from "@/components/ProductCard";
import VendorFormSheet from "@/components/VendorFormSheet";
import PostProductSheet from "@/components/PostProductSheet";
import { CATEGORY_META } from "@/lib/locations";

export default function MyShop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const vendors = await base44.entities.Vendor.list();
      const mine = vendors.find(v => v.created_by_id === user.id) || null;
      setVendor(mine);
      if (mine) {
        let prods = [];
        try { prods = await base44.entities.Product.filter({ vendor_id: mine.id }, "-created_date", 100); } catch (e) {}
        if (prods.length === 0 && mine.shop_name) {
          try { prods = await base44.entities.Product.filter({ vendor_name: mine.shop_name }, "-created_date", 100); } catch (e) {}
        }
        setProducts(prods);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>;

  // No shop yet → create CTA
  if (!vendor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 mb-6 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Back</button>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4"><Store className="w-10 h-10 text-emerald-600" /></div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>Start Your Shop</h1>
            <p className="text-slate-500 max-w-md mx-auto mb-6">Create your vendor profile so buyers can find your products, see your prices, and trust your shop in the local market.</p>
            <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-emerald-600 text-white text-base font-bold hover:bg-emerald-700 transition shadow-sm">
              <Plus className="w-5 h-5" /> Create My Shop
            </button>
          </div>
        </div>
        <VendorFormSheet open={createOpen} onClose={() => setCreateOpen(false)} onSaved={load} />
      </div>
    );
  }

  const specs = vendor.specialties ? vendor.specialties.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 mb-4 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Back</button>

        {/* Shop header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-emerald-100 shrink-0 border-4 border-white shadow">
              {vendor.photo_url ? <Image src={vendor.photo_url} fittingType="fill" className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-emerald-600" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{vendor.shop_name_bn || vendor.shop_name}</h1>
              <p className="text-sm text-slate-500">{[vendor.village, vendor.union, vendor.upazila].filter(Boolean).join(", ")}</p>
              {specs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {specs.map(s => { const c = CATEGORY_META[s]; return <span key={s} className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: c ? `${c.color}15` : "#f1f5f9", color: c ? c.color : "#475569" }}>{c ? c.label_bn : s}</span>; })}
                </div>
              )}
            </div>
            <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 h-11 px-4 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition shrink-0"><Pencil className="w-4 h-4" /> Edit</button>
          </div>
        </div>

        {/* Listings */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Package className="w-5 h-5 text-emerald-600" /> My Products · {products.length}</h2>
            <button onClick={() => setPostOpen(true)} className="flex items-center gap-2 h-11 px-4 rounded-full bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition"><Plus className="w-4 h-4" /> Post Product</button>
          </div>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <PackageOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 mb-4">You haven't posted any products yet.</p>
              <button onClick={() => setPostOpen(true)} className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"><Plus className="w-4 h-4" /> Post your first product</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} onCategoryClick={() => {}} />)}
            </div>
          )}
        </div>
      </div>

      <VendorFormSheet open={createOpen} onClose={() => setCreateOpen(false)} onSaved={load} existing={vendor} />
      <PostProductSheet open={postOpen} onClose={() => setPostOpen(false)} onPosted={load} defaultLocation={vendor} vendor={vendor} offline={false} />
    </div>
  );
}