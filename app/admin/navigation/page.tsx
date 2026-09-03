"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Navigation</h1>
          <p className="mt-1 text-sm text-white/50">Header and footer menu management.</p>
        </div>
        <Button
          type="button"
          onClick={() => toast.success("Saved — connect MongoDB Atlas to persist changes")}
        >
          Save changes
        </Button>
      </div>
      <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
        <Input label="Title / Name" placeholder="Enter value" />
        <Input label="Slug / Code" placeholder="optional-slug" />
        <Textarea
          label="Description"
          className="md:col-span-2"
          rows={4}
          placeholder="Manage this section from the admin portal without editing code."
        />
        <Input label="Image URL" placeholder="https://…" />
        <Input label="Sort order" type="number" defaultValue={0} />
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-silver">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="p-3">Navigation entry {i}</td>
                <td className="p-3 text-fuchsia">Active</td>
                <td className="p-3 text-white/40">Jul 2026</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
