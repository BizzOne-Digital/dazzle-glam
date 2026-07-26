"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";
import { deleteDummyOrders, updateAdminOrderStatus } from "@/actions/orders";
import type { OrderStatus } from "@/types";

type AdminOrderRow = {
  _id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  total: number;
  subtotal?: number;
  shippingAmount?: number;
  taxAmount?: number;
  status: OrderStatus | string;
  paymentStatus: string;
  createdAt?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  courier?: string;
  internalNotes?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
};

function orderId(o: { _id: string | { $oid?: string } | unknown }) {
  if (typeof o._id === "string") return o._id;
  if (o._id && typeof o._id === "object" && "$oid" in (o._id as object)) {
    return String((o._id as { $oid: string }).$oid);
  }
  return String(o._id);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [clearing, setClearing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrderRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders");
      const list = (data.orders || []).map((o: AdminOrderRow) => ({
        ...o,
        _id: orderId(o),
      }));
      setOrders(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/admin/orders/${selectedId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load order");
        if (cancelled) return;
        const o = { ...data.order, _id: orderId(data.order) } as AdminOrderRow;
        setDetail(o);
        setStatus((o.status as OrderStatus) || "pending");
        setTrackingNumber(o.trackingNumber || "");
        setCourier(o.courier || "");
        setInternalNotes(o.internalNotes || "");
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load order");
          setSelectedId(null);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((o) => {
      const name = `${o.shippingAddress?.firstName || ""} ${o.shippingAddress?.lastName || ""}`.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(term) ||
        o.email.toLowerCase().includes(term) ||
        name.includes(term) ||
        o.status.toLowerCase().includes(term)
      );
    });
  }, [orders, q]);

  const clearDummies = async () => {
    if (
      !confirm(
        "Remove dummy/test orders that are not linked to Stripe payments?"
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      const res = await deleteDummyOrders();
      toast.success(`Removed ${res.deleted} dummy order(s)`);
      setSelectedId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear");
    } finally {
      setClearing(false);
    }
  };

  const saveDetail = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const res = await updateAdminOrderStatus(detail._id, {
        status,
        trackingNumber,
        courier,
        internalNotes,
      });
      if (!res.success) throw new Error(res.error || "Update failed");
      toast.success("Order updated");
      setDetail((prev) =>
        prev
          ? { ...prev, status, trackingNumber, courier, internalNotes }
          : prev
      );
      setOrders((prev) =>
        prev.map((o) =>
          o._id === detail._id ? { ...o, status, trackingNumber, courier, internalNotes } : o
        )
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (selectedId) {
    const customer =
      `${detail?.shippingAddress?.firstName || ""} ${detail?.shippingAddress?.lastName || ""}`.trim() ||
      detail?.email ||
      "…";

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to orders
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/orders/${selectedId}`}>Open full page</Link>
          </Button>
        </div>

        {detailLoading || !detail ? (
          <p className="text-white/50">Loading order details…</p>
        ) : (
          <>
            <div>
              <p className="text-xs uppercase tracking-wider text-silver">Order</p>
              <h1 className="font-heading text-3xl text-fuchsia">
                {detail.orderNumber}
              </h1>
            </div>

            <div className="rounded-xl border border-white/10 p-6 space-y-3 text-sm">
              <p>
                <span className="text-white/45">Customer:</span> {customer}
              </p>
              <p>
                <span className="text-white/45">Email:</span> {detail.email}
              </p>
              <p>
                <span className="text-white/45">Phone:</span> {detail.phone || "—"}
              </p>
              <p>
                <span className="text-white/45">Payment:</span>{" "}
                <span className="capitalize">{detail.paymentStatus}</span>
              </p>
              <p>
                <span className="text-white/45">Placed:</span>{" "}
                {detail.createdAt
                  ? new Date(detail.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 p-6">
              <h2 className="font-heading text-xl">Items</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {(detail.items || []).map((item, i) => (
                  <li
                    key={`${item.name}-${i}`}
                    className="flex justify-between gap-3"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      {formatCurrency(item.total ?? item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-white/45">Subtotal</dt>
                  <dd>{formatCurrency(detail.subtotal || 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/45">Shipping</dt>
                  <dd>
                    {(detail.shippingAmount || 0) > 0
                      ? formatCurrency(detail.shippingAmount || 0)
                      : "Free"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/45">Tax</dt>
                  <dd>{formatCurrency(detail.taxAmount || 0)}</dd>
                </div>
                <div className="flex justify-between text-base">
                  <dt>Total</dt>
                  <dd className="text-fuchsia">
                    {formatCurrency(detail.total)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-white/10 p-6 space-y-3 text-sm">
              <h2 className="font-heading text-xl">Shipping address</h2>
              <p>
                {detail.shippingAddress?.line1}
                {detail.shippingAddress?.line2
                  ? `, ${detail.shippingAddress.line2}`
                  : ""}
              </p>
              <p>
                {detail.shippingAddress?.city},{" "}
                {detail.shippingAddress?.province}{" "}
                {detail.shippingAddress?.postalCode}
              </p>
              <p>{detail.shippingAddress?.country || "Canada"}</p>
              <p className="text-white/45">
                Method: {detail.shippingMethod || "standard"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 p-6 space-y-4">
              <Select
                label="Order status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                options={[
                  { label: "Pending", value: "pending" },
                  { label: "Confirmed", value: "confirmed" },
                  { label: "Processing", value: "processing" },
                  { label: "Shipped", value: "shipped" },
                  { label: "Delivered", value: "delivered" },
                  { label: "Cancelled", value: "cancelled" },
                  { label: "Refunded", value: "refunded" },
                ]}
              />
              <Input
                label="Tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Optional"
              />
              <Input
                label="Courier"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="Canada Post, UPS…"
              />
              <Textarea
                label="Internal notes"
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Warehouse notes…"
              />
              <Button onClick={() => void saveDetail()} loading={saving}>
                Update order
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-white/50">
            {loading
              ? "Loading…"
              : `${filtered.length} order${filtered.length === 1 ? "" : "s"} · click a row for details`}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          loading={clearing}
          onClick={() => void clearDummies()}
        >
          Remove dummy orders
        </Button>
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by order #, email, customer…"
        className="max-w-md"
      />

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-silver">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/40">
                  No orders yet. Real Stripe checkouts will appear here.
                </td>
              </tr>
            )}
            {filtered.map((o) => {
              const id = orderId(o);
              const customer =
                `${o.shippingAddress?.firstName || ""} ${o.shippingAddress?.lastName || ""}`.trim() ||
                o.email;
              return (
                <tr
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(id);
                    }
                  }}
                  className="cursor-pointer border-t border-white/5 transition hover:bg-fuchsia/10"
                >
                  <td className="p-3 font-medium text-fuchsia">{o.orderNumber}</td>
                  <td className="p-3">
                    <p>{customer}</p>
                    <p className="text-xs text-white/40">{o.email}</p>
                  </td>
                  <td className="p-3">{formatCurrency(o.total)}</td>
                  <td className="p-3 capitalize text-white/70">{o.paymentStatus}</td>
                  <td className="p-3 capitalize text-white/70">{o.status}</td>
                  <td className="p-3 text-white/40">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
