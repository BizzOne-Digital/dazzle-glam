"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  AdminOrderItemsEditor,
  linesFromOrderItems,
  stripLineKeys,
  type EditableOrderLine,
} from "@/components/admin/AdminOrderItemsEditor";
import { computeOrderTotals } from "@/lib/pricing/orderTotals";
import {
  resendOrderConfirmationEmail,
  updateAdminOrderStatus,
} from "@/actions/orders";
import type { OrderStatus, PaymentStatus } from "@/types";

type OrderDetail = {
  _id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  items: Array<{
    product?: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
    variantLabel?: string;
    sku?: string;
    variantId?: string;
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
  discountAmount?: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [resending, setResending] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [lines, setLines] = useState<EditableOrderLine[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingAmount, setShippingAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [manualTotals, setManualTotals] = useState(false);
  const [taxRate, setTaxRate] = useState(0.13);

  const [shipFirst, setShipFirst] = useState("");
  const [shipLast, setShipLast] = useState("");
  const [shipLine1, setShipLine1] = useState("");
  const [shipLine2, setShipLine2] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipProvince, setShipProvince] = useState("");
  const [shipPostal, setShipPostal] = useState("");
  const [shipCountry, setShipCountry] = useState("CA");

  const applyOrderToForm = useCallback((o: OrderDetail) => {
    setOrder(o);
    setStatus(o.status);
    setPaymentStatus(o.paymentStatus || "pending");
    setTrackingNumber(o.trackingNumber || "");
    setCourier(o.courier || "");
    setInternalNotes(o.internalNotes || "");
    setEmail(o.email);
    setPhone(o.phone || "");
    setLines(linesFromOrderItems(Array.isArray(o.items) ? o.items : []));
    setDiscountAmount(Number(o.discountAmount) || 0);
    setShippingAmount(Number(o.shippingAmount) || 0);
    setTaxAmount(Number(o.taxAmount) || 0);
    setTotal(Number(o.total) || 0);
    setManualTotals(false);
    setShipFirst(o.shippingAddress?.firstName || "");
    setShipLast(o.shippingAddress?.lastName || "");
    setShipLine1(o.shippingAddress?.line1 || "");
    setShipLine2(o.shippingAddress?.line2 || "");
    setShipCity(o.shippingAddress?.city || "");
    setShipProvince(o.shippingAddress?.province || "");
    setShipPostal(o.shippingAddress?.postalCode || "");
    setShipCountry(o.shippingAddress?.country || "CA");
  }, []);

  useEffect(() => {
    void fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.taxRate === "number") setTaxRate(data.taxRate);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        applyOrderToForm(data.order as OrderDetail);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, applyOrderToForm]);

  const recalculateTotals = useCallback(() => {
    const subtotal = lines.reduce(
      (sum, line) =>
        sum + Math.max(0, line.price) * Math.max(1, line.quantity),
      0
    );
    const totals = computeOrderTotals(
      subtotal,
      discountAmount,
      shippingAmount,
      taxRate
    );
    setTaxAmount(totals.taxAmount);
    setTotal(totals.total);
    setManualTotals(false);
  }, [lines, discountAmount, shippingAmount, taxRate]);

  const save = async () => {
    if (!order) return;
    if (!lines.length) {
      toast.error("Order needs at least one line item");
      return;
    }
    if (!email.trim()) {
      toast.error("Customer email is required");
      return;
    }

    setSaving(true);
    try {
      const res = await updateAdminOrderStatus(order._id, {
        status,
        paymentStatus,
        trackingNumber,
        courier,
        internalNotes,
        email,
        phone,
        shippingAddress: {
          firstName: shipFirst,
          lastName: shipLast,
          line1: shipLine1,
          line2: shipLine2 || undefined,
          city: shipCity,
          province: shipProvince,
          postalCode: shipPostal,
          country: shipCountry,
        },
        items: stripLineKeys(lines),
        discountAmount,
        shippingAmount,
        recalculateTotals: !manualTotals,
        ...(manualTotals ? { taxAmount, total } : {}),
      });
      if (!res.success) throw new Error(res.error || "Update failed");
      toast.success("Order updated");
      const updated = res.data as OrderDetail | undefined;
      if (updated) {
        applyOrderToForm({
          ...order,
          ...updated,
          items: (updated.items || order.items) as OrderDetail["items"],
        });
      }
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
    `${shipFirst || order.shippingAddress?.firstName || ""} ${shipLast || order.shippingAddress?.lastName || ""}`.trim() ||
    "Customer";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-silver">Order</p>
          <h1 className="font-heading text-3xl text-fuchsia">{order.orderNumber}</h1>
        </div>
        <Button asChild variant="secondary">
          <Link href="/admin/orders">All orders</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 p-6 space-y-4 text-sm">
        <h2 className="font-heading text-xl">Customer</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <p className="text-white/45">
          Display name: {customerName} · Placed:{" "}
          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
        </p>
        <p>
          <span className="text-white/45">Payment:</span>{" "}
          <span className="capitalize">{order.paymentStatus}</span>
          {order.paymentMethod === "interac" && order.paymentStatus === "pending" && (
            <span className="ml-2 text-xs text-amber-300">
              (Awaiting Interac e-Transfer)
            </span>
          )}
          {order.paymentMethod && (
            <span className="ml-2 capitalize text-white/60">
              via {order.paymentMethod}
            </span>
          )}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 p-6">
        <AdminOrderItemsEditor
          lines={lines}
          onChange={setLines}
          discountAmount={discountAmount}
          shippingAmount={shippingAmount}
          taxAmount={taxAmount}
          total={total}
          onDiscountChange={(v) => {
            setDiscountAmount(v);
            setManualTotals(false);
          }}
          onShippingChange={(v) => {
            setShippingAmount(v);
            setManualTotals(false);
          }}
          onTaxChange={(v) => {
            setTaxAmount(v);
            setManualTotals(true);
          }}
          onTotalChange={(v) => {
            setTotal(v);
            setManualTotals(true);
          }}
          onRecalculateTotals={recalculateTotals}
        />
      </div>

      <div className="rounded-xl border border-white/10 p-6 space-y-4 text-sm">
        <h2 className="font-heading text-xl">Shipping address</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="First name"
            value={shipFirst}
            onChange={(e) => setShipFirst(e.target.value)}
          />
          <Input
            label="Last name"
            value={shipLast}
            onChange={(e) => setShipLast(e.target.value)}
          />
          <Input
            label="Address line 1"
            className="md:col-span-2"
            value={shipLine1}
            onChange={(e) => setShipLine1(e.target.value)}
          />
          <Input
            label="Address line 2"
            className="md:col-span-2"
            value={shipLine2}
            onChange={(e) => setShipLine2(e.target.value)}
          />
          <Input label="City" value={shipCity} onChange={(e) => setShipCity(e.target.value)} />
          <Input
            label="Province"
            value={shipProvince}
            onChange={(e) => setShipProvince(e.target.value)}
          />
          <Input
            label="Postal code"
            value={shipPostal}
            onChange={(e) => setShipPostal(e.target.value)}
          />
          <Input
            label="Country"
            value={shipCountry}
            onChange={(e) => setShipCountry(e.target.value)}
          />
        </div>
        <p className="text-white/45">
          Shipping method: {order.shippingMethod || "standard"}
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
        <Select
          label="Payment status"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          options={[
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Failed", value: "failed" },
            { label: "Refunded", value: "refunded" },
            { label: "Partially refunded", value: "partially_refunded" },
          ]}
        />
        <p className="text-xs text-white/45">
          Saving also updates line items, customer details, and totals. Confirmed /
          Shipped still auto-marks Interac as paid. Shipped sends the tracking email
          when status changes to shipped.
        </p>
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
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void save()} loading={saving}>
            Save order changes
          </Button>
          <Button
            type="button"
            variant="secondary"
            loading={resending}
            onClick={async () => {
              if (!order) return;
              setResending(true);
              try {
                const res = await resendOrderConfirmationEmail(order._id);
                if (!res.success) {
                  throw new Error(res.error || "Could not send email");
                }
                toast.success("Confirmation email sent");
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Could not send email"
                );
              } finally {
                setResending(false);
              }
            }}
          >
            Resend confirmation email
          </Button>
        </div>
      </div>
    </div>
  );
}
