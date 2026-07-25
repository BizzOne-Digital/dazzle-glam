"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LocalImageField } from "@/components/admin/LocalImageField";
import { createProductAdmin } from "@/actions/products";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(10);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>(["", ""]);

  const setImageAt = (index: number, url: string) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = images.filter(Boolean).slice(0, 3);
    if (clean.length < 1) {
      toast.error("Upload at least 1 image");
      return;
    }
    setLoading(true);
    const result = await createProductAdmin({
      name,
      slug: slug || undefined,
      description,
      price,
      stock,
      images: clean,
    });
    setLoading(false);
    if (result.success && result.data) {
      toast.success("Product created");
      router.push(`/admin/products/${result.data.id}`);
    } else toast.error(result.error || "Create failed");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl">Add Product</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-white/10 p-6">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Slug (optional)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-from-name"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
          <Input
            label="Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </div>
        <Textarea
          label="Description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <LocalImageField
          label="Image 1"
          folder="products"
          value={images[0]}
          onChange={(url) => setImageAt(0, url)}
        />
        <LocalImageField
          label="Image 2"
          folder="products"
          value={images[1]}
          onChange={(url) => setImageAt(1, url)}
        />
        {images.length < 3 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setImages((prev) => [...prev, ""])}
          >
            Add 3rd image (optional)
          </Button>
        )}
        {images[2] !== undefined && (
          <LocalImageField
            label="Image 3 (optional)"
            folder="products"
            value={images[2]}
            onChange={(url) => setImageAt(2, url)}
          />
        )}
        <Button type="submit" loading={loading}>
          Create Product
        </Button>
      </form>
    </div>
  );
}
