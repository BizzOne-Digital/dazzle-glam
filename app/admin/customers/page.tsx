"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

type AdminCustomer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  orderCount: number;
  totalSpent: number;
  isDisabled: boolean;
  notes?: string;
  createdAt?: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load customers");
      setCustomers(data.customers || []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phone || "").toLowerCase().includes(term)
    );
  }, [customers, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Customers</h1>
          <p className="mt-1 text-sm text-white/50">
            Registered customer accounts from the storefront.
          </p>
        </div>
        <p className="text-sm text-white/45">
          {loading ? "Loading…" : `${filtered.length} customer${filtered.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <Input
        label="Search"
        placeholder="Search by name, email, or phone"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-silver">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Spent</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-6 text-white/40" colSpan={7}>
                  Loading customers…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-6 text-white/40" colSpan={7}>
                  No customers found. New registrations from the account page
                  will appear here.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c._id} className="border-t border-white/5">
                  <td className="p-3 font-medium text-white">{c.name}</td>
                  <td className="p-3 text-white/70">{c.email}</td>
                  <td className="p-3 text-white/50">{c.phone || "—"}</td>
                  <td className="p-3">{c.orderCount}</td>
                  <td className="p-3">{formatCurrency(c.totalSpent)}</td>
                  <td className="p-3 text-white/40">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("en-CA")
                      : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        c.isDisabled ? "text-red-400" : "text-emerald-400"
                      }
                    >
                      {c.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
