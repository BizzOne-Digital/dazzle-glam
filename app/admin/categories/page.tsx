"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw, Tags } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { LocalImageField } from "@/components/admin/LocalImageField";
import { slugify } from "@/lib/utils";
import {
  createCategory,
  getCategories,
  updateCategory,
  type CategoryItemPlain,
} from "@/actions/categories";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  sortOrder: 0,
  isPublished: true,
};

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<CategoryItemPlain[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setItems(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setSlugTouched(false);
  };

  const startEdit = (item: CategoryItemPlain) => {
    setEditId(item._id);
    setSlugTouched(true);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      image: item.image || "",
      sortOrder: item.sortOrder ?? 0,
      isPublished: item.isPublished !== false,
    });
  };

  const onNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: slugTouched ? f.slug : slugify(name),
    }));
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
        sortOrder: form.sortOrder,
        isPublished: form.isPublished,
      };

      if (editId) {
        const res = await updateCategory(editId, payload);
        if (!res.success) throw new Error(res.error);
        toast.success("Category updated");
      } else {
        const res = await createCategory(payload);
        if (!res.success) throw new Error(res.error);
        toast.success("Category created");
      }
      resetForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-white/50">
            Create and manage product categories for your catalog.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Rings"
        />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setForm((f) => ({ ...f, slug: e.target.value }));
          }}
          placeholder="e.g. rings"
          hint="Used in URLs — lowercase letters, numbers, hyphens only"
        />
        <Textarea
          label="Description"
          className="md:col-span-2"
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Optional short description"
        />
        <Input
          label="Sort order"
          type="number"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              sortOrder: Number(e.target.value) || 0,
            }))
          }
        />
        <LocalImageField
          label="Image (optional)"
          folder="categories"
          value={form.image}
          onChange={(url) => setForm((f) => ({ ...f, image: url }))}
        />
        <label className="flex items-center gap-2 text-sm text-white/70 md:col-span-2">
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
            {editId ? "Update category" : "Create category"}
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
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-white/40">
          <Tags className="mx-auto mb-3 h-8 w-8 opacity-40" />
          <p>No categories yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-silver">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Order</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t border-white/5">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-white/50">{item.slug}</td>
                  <td className="p-3 text-white/50">{item.sortOrder ?? 0}</td>
                  <td className="p-3">
                    {item.isPublished !== false ? (
                      <span className="text-fuchsia">Published</span>
                    ) : (
                      <span className="text-white/40">Draft</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="text-sm text-fuchsia hover:underline"
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
