"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { demoProducts } from "@/lib/data/demo";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const products = useMemo(
    () =>
      demoProducts.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Products</h1>
          <p className="text-sm text-white/50">{products.length} catalog items</p>
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
            {products.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded">
                      <Image src={p.images[0]} alt="" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="max-w-xs truncate font-medium">{p.name}</p>
                      <p className="text-xs text-white/40">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{formatCurrency(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 text-xs text-fuchsia">
                  {[p.isNewArrival && "New", p.isBestSeller && "Best", p.isFeatured && "Featured"]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${p.id}`} className="text-fuchsia hover:underline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="text-white/40 hover:text-white"
                      onClick={() => toast.success("Duplicated (connect MongoDB to persist)")}
                    >
                      Duplicate
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
