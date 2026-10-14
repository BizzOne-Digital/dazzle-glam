"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import type { AdminOrderLineInput } from "@/lib/services/adminOrderEdit";

export type EditableOrderLine = AdminOrderLineInput & { key: string };

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  sku?: string;
  images?: string[];
  variants?: Array<{
    id?: string;
    name: string;
    price?: number;
    sku?: string;
    stock?: number;
  }>;
};

function newLineKey() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toEditableLine(
  item: AdminOrderLineInput,
  index: number
): EditableOrderLine {
  return {
    key: `existing-${index}`,
    productId: item.productId,
    variantId: item.variantId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    variantLabel: item.variantLabel,
    sku: item.sku,
    image: item.image,
  };
}

export function linesFromOrderItems(
  items: Array<
    AdminOrderLineInput & { product?: string | { toString(): string } }
  >
): EditableOrderLine[] {
  return items.map((item, index) =>
    toEditableLine(
      {
        ...item,
        productId:
          item.productId ||
          (item.product
            ? typeof item.product === "string"
              ? item.product
              : String(item.product)
            : undefined),
      },
      index
    )
  );
}

export function stripLineKeys(lines: EditableOrderLine[]): AdminOrderLineInput[] {
  return lines.map((line) => {
    const { productId, variantId, name, quantity, price, variantLabel, sku, image } =
      line;
    return {
      productId,
      variantId,
      name,
      quantity,
      price,
      variantLabel,
      sku,
      image,
    };
  });
}

type Props = {
  lines: EditableOrderLine[];
  onChange: (lines: EditableOrderLine[]) => void;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  onDiscountChange: (value: number) => void;
  onShippingChange: (value: number) => void;
  onTaxChange: (value: number) => void;
  onTotalChange: (value: number) => void;
  onRecalculateTotals: () => void;
};

export function AdminOrderItemsEditor({
  lines,
  onChange,
  discountAmount,
  shippingAmount,
  taxAmount,
  total,
  onDiscountChange,
  onShippingChange,
  onTaxChange,
  onTotalChange,
  onRecalculateTotals,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [pickProductId, setPickProductId] = useState<string | null>(null);
  const [pickVariantId, setPickVariantId] = useState("");

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) =>
          sum + Math.max(0, line.price) * Math.max(1, line.quantity),
        0
      ),
    [lines]
  );

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products");
      setCatalog((data.products || []) as CatalogProduct[]);
    } catch {
      setCatalog([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pickerOpen && !catalog.length && !catalogLoading) {
      void loadCatalog();
    }
  }, [pickerOpen, catalog.length, catalogLoading, loadCatalog]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return catalog.slice(0, 80);
    return catalog
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 80);
  }, [catalog, productSearch]);

  const pickedProduct = pickProductId
    ? catalog.find((p) => p.id === pickProductId)
    : null;

  const updateLine = (key: string, patch: Partial<EditableOrderLine>) => {
    onChange(
      lines.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  };

  const removeLine = (key: string) => {
    if (lines.length <= 1) return;
    onChange(lines.filter((line) => line.key !== key));
  };

  const addManualLine = () => {
    onChange([
      ...lines,
      {
        key: newLineKey(),
        name: "",
        quantity: 1,
        price: 0,
        variantLabel: "",
      },
    ]);
  };

  const confirmAddFromCatalog = () => {
    if (!pickedProduct) return;
    const variant = pickVariantId
      ? pickedProduct.variants?.find((v) => v.id === pickVariantId)
      : undefined;
    onChange([
      ...lines,
      {
        key: newLineKey(),
        productId: pickedProduct.id,
        variantId: variant?.id || pickVariantId || undefined,
        name: pickedProduct.name,
        quantity: 1,
        price: variant?.price ?? pickedProduct.price,
        variantLabel: variant?.name,
        sku: variant?.sku ?? pickedProduct.sku,
        image: pickedProduct.images?.[0],
      },
    ]);
    setPickerOpen(false);
    setPickProductId(null);
    setPickVariantId("");
    setProductSearch("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-xl">Line items (editable)</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={addManualLine}>
            <Plus className="mr-1 h-4 w-4" />
            Blank line
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add from catalog
          </Button>
        </div>
      </div>

      <p className="text-xs text-white/45">
        Fix missing sizes or variants, wrong quantities, or swap products before
        fulfillment. Tax and total update when you save (or use Recalculate).
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wider text-white/45">
              <th className="pb-2 pr-2 font-medium">Item name</th>
              <th className="pb-2 pr-2 font-medium">Variant / size</th>
              <th className="pb-2 pr-2 font-medium">SKU</th>
              <th className="pb-2 w-20 font-medium">Qty</th>
              <th className="pb-2 w-24 font-medium">Unit $</th>
              <th className="pb-2 w-24 text-right font-medium">Line</th>
              <th className="pb-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const lineTotal =
                Math.round(
                  Math.max(0, line.price) * Math.max(1, line.quantity) * 100
                ) / 100;
              return (
                <tr key={line.key} className="border-b border-white/5 align-top">
                  <td className="py-2 pr-2">
                    <input
                      className="w-full min-w-[140px] rounded border border-white/15 bg-white/5 px-2 py-1.5 text-white"
                      value={line.name}
                      onChange={(e) =>
                        updateLine(line.key, { name: e.target.value })
                      }
                      placeholder="Product name"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      className="w-full min-w-[120px] rounded border border-white/15 bg-white/5 px-2 py-1.5 text-fuchsia"
                      value={line.variantLabel || ""}
                      onChange={(e) =>
                        updateLine(line.key, { variantLabel: e.target.value })
                      }
                      placeholder="Size 7 · 6mm…"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      className="w-full min-w-[80px] rounded border border-white/15 bg-white/5 px-2 py-1.5 text-white/80"
                      value={line.sku || ""}
                      onChange={(e) => updateLine(line.key, { sku: e.target.value })}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded border border-white/15 bg-white/5 px-2 py-1.5 text-center text-white"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.key, {
                          quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                        })
                      }
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full rounded border border-white/15 bg-white/5 px-2 py-1.5 text-white"
                      value={line.price}
                      onChange={(e) =>
                        updateLine(line.key, {
                          price: Math.max(0, parseFloat(e.target.value) || 0),
                        })
                      }
                    />
                  </td>
                  <td className="py-2 text-right text-white/90">
                    {formatCurrency(lineTotal)}
                  </td>
                  <td className="py-2 text-center">
                    <button
                      type="button"
                      className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-red-300 disabled:opacity-30"
                      disabled={lines.length <= 1}
                      onClick={() => removeLine(line.key)}
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dl className="space-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-white/45">Subtotal (from lines)</dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-white/45">Discount</dt>
          <dd>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-28 rounded border border-white/15 bg-white/5 px-2 py-1 text-right"
              value={discountAmount}
              onChange={(e) =>
                onDiscountChange(Math.max(0, parseFloat(e.target.value) || 0))
              }
            />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-white/45">Shipping</dt>
          <dd>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-28 rounded border border-white/15 bg-white/5 px-2 py-1 text-right"
              value={shippingAmount}
              onChange={(e) =>
                onShippingChange(Math.max(0, parseFloat(e.target.value) || 0))
              }
            />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-white/45">Tax</dt>
          <dd>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-28 rounded border border-white/15 bg-white/5 px-2 py-1 text-right"
              value={taxAmount}
              onChange={(e) =>
                onTaxChange(Math.max(0, parseFloat(e.target.value) || 0))
              }
            />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 text-base">
          <dt>Total</dt>
          <dd className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-28 rounded border border-white/15 bg-white/5 px-2 py-1 text-right text-fuchsia"
              value={total}
              onChange={(e) =>
                onTotalChange(Math.max(0, parseFloat(e.target.value) || 0))
              }
            />
          </dd>
        </div>
        <div className="pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onRecalculateTotals}>
            Recalculate tax &amp; total
          </Button>
        </div>
      </dl>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add product to order"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Search products"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Ring name…"
          />
          {catalogLoading ? (
            <p className="text-sm text-white/50">Loading catalog…</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-white/10 p-2">
              {filteredProducts.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                      pickProductId === p.id
                        ? "bg-fuchsia/20 text-fuchsia"
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => {
                      setPickProductId(p.id);
                      setPickVariantId("");
                    }}
                  >
                    {p.name}{" "}
                    <span className="text-white/45">
                      ({formatCurrency(p.price)})
                    </span>
                  </button>
                </li>
              ))}
              {!filteredProducts.length && (
                <li className="px-2 py-4 text-center text-sm text-white/45">
                  No products found
                </li>
              )}
            </ul>
          )}
          {pickedProduct && (pickedProduct.variants?.length ?? 0) > 0 && (
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-silver">
                Variant
              </label>
              <select
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                value={pickVariantId}
                onChange={(e) => setPickVariantId(e.target.value)}
              >
                <option value="">— Select variant —</option>
                {pickedProduct.variants!.map((v) => (
                  <option key={v.id || v.name} value={v.id || ""}>
                    {v.name}
                    {v.stock !== undefined ? ` (stock ${v.stock})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setPickerOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!pickedProduct}
              onClick={confirmAddFromCatalog}
            >
              Add to order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
