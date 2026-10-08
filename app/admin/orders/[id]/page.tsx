"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";
import { updateAdminOrderStatus } from "@/actions/orders";
import type { OrderStatus } from "@/types";

type OrderDetail = {
  _id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
    variantLabel?: string;
    sku?: string;
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
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  shippingMethod?: string;
  trackingNumber?: string;
  courier?: string;
  internalNotes?: string;
  createdAt?: string;
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        const o = data.order as OrderDetail;
        setOrder(o);
        setStatus(o.status);
        setTrackingNumber(o.trackingNumber || "");
        setCourier(o.courier || "");
        setInternalNotes(o.internalNotes || "");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const save = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await updateAdminOrderStatus(order._id, {
        status,
        trackingNumber,
        courier,
        internalNotes,
      });
      if (!res.success) throw new Error(res.error || "Update failed");
      toast.success("Order updated");
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status,
              trackingNumber,
              courier,
              internalNotes,
            }
          : prev
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-white/50">Loading order…</p>;
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <p className="text-white/50">Order not found.</p>
        <Button asChild variant="secondary">
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const customerName =
    `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
    "Customer";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-silver">Order</p>
          <h1 className="font-heading text-3xl text-fuchsia">{order.orderNumber}</h1>
        </div>
        <Button asChild variant="secondary">
          <Link href="/admin/orders">All orders</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 p-6 space-y-3 text-sm">
        <p>
          <span className="text-white/45">Customer:</span> {customerName}
        </p>
        <p>
          <span className="text-white/45">Email:</span> {order.email}
        </p>
        <p>
          <span className="text-white/45">Phone:</span> {order.phone || "—"}
        </p>
        <p>
          <span className="text-white/45">Payment:</span>{" "}
          <span className="capitalize">{order.paymentStatus}</span>
        </p>
        <p>
          <span className="text-white/45">Placed:</span>{" "}
          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 p-6">
        <h2 className="font-heading text-xl">Order summary</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/45">
                <th className="pb-2 font-medium">Ring / Item</th>
                <th className="pb-2 font-medium">Variant</th>
                <th className="pb-2 font-medium">SKU</th>
                <th className="pb-2 text-center font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={`${item.name}-${i}`} className="border-b border-white/5">
                  <td className="py-3 pr-3 text-white">{item.name}</td>
                  <td className="py-3 pr-3 text-fuchsia">
                    {item.variantLabel || "—"}
                  </td>
                  <td className="py-3 pr-3 text-white/60">{item.sku || "—"}</td>
                  <td className="py-3 text-center text-white/80">{item.quantity}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(item.total ?? item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/45">Subtotal</dt>
            <dd>{formatCurrency(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/45">Shipping</dt>
            <dd>
              {order.shippingAmount > 0
                ? formatCurrency(order.shippingAmount)
                : "Free"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/45">Tax</dt>
            <dd>{formatCurrency(order.taxAmount)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt>Total</dt>
            <dd className="text-fuchsia">{formatCurrency(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-white/10 p-6 space-y-3 text-sm">
        <h2 className="font-heading text-xl">Shipping address</h2>
        <p>
          {order.shippingAddress?.line1}
          {order.shippingAddress?.line2
            ? `, ${order.shippingAddress.line2}`
            : ""}
        </p>
        <p>
          {order.shippingAddress?.city}, {order.shippingAddress?.province}{" "}
          {order.shippingAddress?.postalCode}
        </p>
        <p>{order.shippingAddress?.country || "Canada"}</p>
        <p className="text-white/45">
          Method: {order.shippingMethod || "standard"}
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
        <Button onClick={() => void save()} loading={saving}>
          Update order
        </Button>
      </div>
    </div>
  );
}
