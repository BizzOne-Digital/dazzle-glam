"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { demoProducts } from "@/lib/data/demo";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const product = useMemo(
    () => demoProducts.find((p) => p.id === params.id),
    [params.id]
  );
  const [loading, setLoading] = useState(false);

  if (!product) {
    return <p className="text-white/50">Product not found in demo catalog.</p>;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Product updated (connect MongoDB to persist)");
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl">Edit Product</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-white/10 p-6">
        <Input label="Name" name="name" defaultValue={product.name} required />
        <Input label="Slug" name="slug" defaultValue={product.slug} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Price" name="price" type="number" step="0.01" defaultValue={product.price} />
          <Input label="Stock" name="stock" type="number" defaultValue={product.stock} />
        </div>
        <Textarea label="Description" name="description" rows={5} defaultValue={product.description} />
        {product.images.slice(0, 4).map((img, i) => (
          <Input key={img} label={`Image URL ${i + 1}`} name={`image${i}`} defaultValue={img} />
        ))}
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
