"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Product saved as draft (connect MongoDB to persist)");
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl">Add Product</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-white/10 p-6">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input label="Slug" name="slug" defaultValue={slugify(name)} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Price" name="price" type="number" step="0.01" required />
          <Input label="Compare-at" name="compareAt" type="number" step="0.01" />
          <Input label="Stock" name="stock" type="number" defaultValue={10} />
        </div>
        <Textarea label="Description" name="description" rows={5} required />
        <Input label="Image URL 1" name="image1" placeholder="https://…" />
        <Input label="Image URL 2" name="image2" />
        <Input label="Image URL 3" name="image3" />
        <Input label="Image URL 4" name="image4" />
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" className="accent-fuchsia" /> Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="bestseller" className="accent-fuchsia" /> Bestseller
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="newArrival" className="accent-fuchsia" /> New arrival
          </label>
        </div>
        <Button type="submit" loading={loading}>
          Save Product
        </Button>
      </form>
    </div>
  );
}
