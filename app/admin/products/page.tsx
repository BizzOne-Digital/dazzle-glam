"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { deleteProductAdmin, duplicateProductAdmin } from "@/actions/products";
import type { DemoProduct } from "@/lib/data/demo";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<DemoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setProducts(data.products || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    [products, q]
  );

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const res = await deleteProductAdmin(id);
    if (res.success) {
      toast.success("Product deleted");
      await load();
    } else toast.error(res.error || "Delete failed");
  };

  const onDuplicate = async (id: string) => {
    setDuplicatingId(id);
    try {
      const res = await duplicateProductAdmin(id);
      if (res.success && res.data) {
        toast.success("Product duplicated");
        await load();
      } else {
        toast.error(res.error || "Duplicate failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duplicate failed");
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Products</h1>
          <p className="text-sm text-white/50">
            {loading ? "Loading…" : `${filtered.length} catalog items`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        className="max-w-md"
      />
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-silver">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Flags</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded">
                      <Image src={p.images[0]} alt="" fill className="object-contain object-center p-0.5" />
                    </div>
                    <div>
                      <p className="max-w-xs truncate font-medium">{p.name}</p>
                      <p className="text-xs text-white/40">{p.slug}</p>
                      {(p.sku || p.supplier) && (
                        <p className="text-xs text-white/35">
                          {[p.sku && `SKU: ${p.sku}`, p.supplier && `Supplier: ${p.supplier}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span
                      className={
                        p.isOnSale && (p.compareAtPrice || 0) > p.price
                          ? "font-medium text-red-400"
                          : undefined
                      }
                    >
                      {formatCurrency(p.price)}
                    </span>
                    {p.isOnSale && (p.compareAtPrice || 0) > p.price && (
                      <span className="text-xs text-white/45 line-through">
                        {formatCurrency(p.compareAtPrice || 0)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 text-xs text-fuchsia">
                  {[
                    p.isComingSoon && "Coming Soon",
                    p.isOnSale && "Sale",
                    p.isNewArrival && "New",
                    p.isBestSeller && "Bestseller",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/admin/products/${p.id}`} className="text-fuchsia hover:underline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="text-fuchsia/80 hover:underline disabled:opacity-50"
                      disabled={duplicatingId === p.id}
                      onClick={() => void onDuplicate(p.id)}
                    >
                      {duplicatingId === p.id ? "Duplicating…" : "Duplicate"}
                    </button>
                    <button
                      type="button"
                      className="text-white/40 hover:text-white"
                      onClick={() => void onDelete(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
