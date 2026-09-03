"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LocalImageField } from "@/components/admin/LocalImageField";
import {
  createGalleryItem,
  deleteGalleryItem,
  getGalleryItems,
  seedGalleryFromStatic,
  updateGalleryItem,
} from "@/actions/gallery";

type Item = {
  _id: string;
  title?: string;
  caption?: string;
  image: string;
  category?: string;
  tall?: boolean;
  sortOrder?: number;
  isPublished?: boolean;
};

const emptyForm = {
  title: "",
  caption: "",
  image: "",
  category: "product",
  tall: false,
  sortOrder: 0,
  isPublished: true,
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getGalleryItems(false);
    setItems(data as Item[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const startEdit = (item: Item) => {
    if (item._id.startsWith("static-")) {
      toast.error("Seed gallery into database first (button below)");
      return;
    }
    setEditId(item._id);
    setForm({
      title: item.title || "",
      caption: item.caption || "",
      image: item.image,
      category: item.category || "product",
      tall: !!item.tall,
      sortOrder: item.sortOrder || 0,
      isPublished: item.isPublished !== false,
    });
  };

  const onSave = async () => {
    if (!form.image) {
      toast.error("Upload an image first");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const res = await updateGalleryItem(editId, form);
        if (!res.success) throw new Error(res.error);
        toast.success("Gallery item updated");
      } else {
        const res = await createGalleryItem(form);
        if (!res.success) throw new Error("Create failed");
        toast.success("Gallery item added");
      }
      resetForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (id.startsWith("static-")) {
      toast.error("Seed gallery into database first");
      return;
    }
    if (!confirm("Delete this gallery image?")) return;
    const res = await deleteGalleryItem(id);
    if (res.success) {
      toast.success("Deleted");
      await load();
    } else toast.error("Delete failed");
  };

  const onSeed = async () => {
    const res = await seedGalleryFromStatic();
    if (res.success) {
      toast.success(res.message || "Seeded");
      await load();
    } else toast.error("Seed failed");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Gallery</h1>
          <p className="mt-1 text-sm text-white/50">
            Upload, edit, or delete gallery images (stored in /public/uploads).
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button type="button" variant="secondary" onClick={() => void onSeed()}>
            Seed from files
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Input
          label="Caption"
          value={form.caption}
          onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
        />
        <div>
          <label className="mb-1 block text-sm text-white/70">Category</label>
          <select
            className="h-11 w-full rounded-sm border border-white/15 bg-black px-3 text-sm text-white"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="product">Product</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="editorial">Editorial</option>
          </select>
        </div>
        <Input
          label="Sort order"
          type="number"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
          }
        />
        <LocalImageField
          label="Image"
          folder="gallery"
          value={form.image}
          onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          className="md:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={form.tall}
            onChange={(e) => setForm((f) => ({ ...f, tall: e.target.checked }))}
          />
          Tall masonry tile
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) =>
              setForm((f) => ({ ...f, isPublished: e.target.checked }))
            }
          />
          Published
        </label>
        <div className="flex gap-2 md:col-span-2">
          <Button type="button" loading={saving} onClick={() => void onSave()}>
            <Plus className="h-4 w-4" />
            {editId ? "Update item" : "Add item"}
          </Button>
          {editId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-white/40">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
            >
              <div className="relative aspect-square">
                <Image src={item.image} alt={item.caption || ""} fill className="object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <p className="line-clamp-1 text-sm">{item.caption || item.title}</p>
                <p className="text-[11px] uppercase tracking-wider text-silver">
                  {item.category} {item.tall ? "· tall" : ""}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-sm text-fuchsia hover:underline"
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm text-white/40 hover:text-white"
                    onClick={() => void onDelete(item._id)}
                  >
                    <Trash2 className="inline h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
