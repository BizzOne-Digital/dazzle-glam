"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl">Order {params.id}</h1>
      <div className="rounded-xl border border-white/10 p-6 space-y-4">
        <p className="text-sm text-white/50">Customer: Aaliyah M. · dazzle.customer@email.com</p>
        <p className="text-sm">Total: {formatCurrency(145.98)} · Payment: Paid</p>
        <Select
          label="Order status"
          defaultValue="processing"
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
        <Textarea label="Internal notes" rows={3} placeholder="Warehouse notes…" />
        <div className="flex gap-3">
          <Button onClick={() => toast.success("Order updated")}>Update status</Button>
          <Button variant="secondary" onClick={() => toast.success("Packing slip ready")}>
            Print packing slip
          </Button>
        </div>
      </div>
    </div>
  );
}
