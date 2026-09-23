import { useEffect, useState } from "react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../hooks/useWishlist";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); return; }
    Promise.all(ids.map((id) => api.get(`/products/${id}`).then(r => r.data).catch(() => null)))
      .then((arr) => setProducts(arr.filter(Boolean)));
  }, [ids]);

  return (
    <main className="bg-white min-h-screen px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Ma sélection</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold text-[#FEC4D2]">
          Ma <span className="editorial text-neutral-900">wishlist</span>
        </h1>
        <p className="mt-3 text-neutral-600">{products.length} produit{products.length > 1 ? "s" : ""} sauvegardé{products.length > 1 ? "s" : ""}.</p>

        {products.length === 0 ? (
          <div className="mt-16 border border-[#FEC4D2]/60 rounded-3xl p-16 text-center bg-white">
            <p className="editorial text-2xl text-[#79C1E0]">Ta wishlist est vide.</p>
            <p className="mt-2 text-sm text-neutral-600">Survole une card produit et clique sur le cœur pour l'ajouter.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </div>
    </main>
  );
}
