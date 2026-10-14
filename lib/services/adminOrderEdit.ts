import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import {
  computeLineTotal,
  computeOrderTotals,
} from "@/lib/pricing/orderTotals";
import type { AdminOrderLineInput } from "@/lib/types/adminOrder";
import { Product, SiteSettings, type IProduct, type ISiteSettings } from "@/models";
import type { IOrderItem } from "@/models/Commerce";
import type { Address } from "@/types";

export type { AdminOrderLineInput } from "@/lib/types/adminOrder";
export { computeLineTotal, computeOrderTotals } from "@/lib/pricing/orderTotals";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function getOrderTaxRate(): Promise<number> {
  await connectDB();
  const settings = (await SiteSettings.findOne().lean()) as ISiteSettings | null;
  return settings?.taxRate ?? 0.13;
}

export async function normalizeAdminOrderLines(
  lines: AdminOrderLineInput[]
): Promise<IOrderItem[]> {
  if (!lines.length) {
    throw new Error("Order must include at least one line item");
  }

  await connectDB();

  const validProductIds = [
    ...new Set(
      lines
        .map((line) => line.productId)
        .filter((id): id is string => !!id && mongoose.Types.ObjectId.isValid(id))
    ),
  ];

  const products =
    validProductIds.length > 0
      ? ((await Product.find({ _id: { $in: validProductIds } }).lean()) as IProduct[])
      : [];

  const productMap = new Map(products.map((p) => [String(p._id), p]));

  return lines.map((line) => {
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
    const price = roundMoney(Math.max(0, Number(line.price) || 0));
    const total = computeLineTotal(price, quantity);

    let name = (line.name || "").trim() || "Item";
    let variantLabel = line.variantLabel?.trim() || undefined;
    let sku = line.sku?.trim() || undefined;
    let image = line.image?.trim() || undefined;
    const variantId = line.variantId?.trim() || undefined;
    let productRef: mongoose.Types.ObjectId | undefined;

    if (line.productId && mongoose.Types.ObjectId.isValid(line.productId)) {
      productRef = new mongoose.Types.ObjectId(line.productId);
      const product = productMap.get(line.productId);
      if (product) {
        if (!line.name?.trim()) name = product.name;
        if (!image && product.media[0]?.url) {
          image = product.media[0].url;
        }

        if (variantId) {
          const variant = product.variants.find((v) => String(v._id) === variantId);
          if (variant) {
            if (!variantLabel) variantLabel = variant.name;
            if (!sku) sku = variant.sku ?? product.sku;
          }
        } else if (!sku) {
          sku = product.sku;
        }
      }
    }

    return {
      product: productRef,
      variantId,
      name,
      sku,
      image,
      variantLabel,
      quantity,
      price,
      total,
    };
  });
}

export function mergeShippingAddress(
  current: Address | undefined,
  patch: Partial<Address> | undefined
): Address {
  const base = current || {
    firstName: "",
    lastName: "",
    line1: "",
    city: "",
    province: "",
    postalCode: "",
    country: "CA",
  };
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    firstName: patch.firstName ?? base.firstName,
    lastName: patch.lastName ?? base.lastName,
    line1: patch.line1 ?? base.line1,
    city: patch.city ?? base.city,
    province: patch.province ?? base.province,
    postalCode: patch.postalCode ?? base.postalCode,
    country: patch.country ?? base.country,
  };
}
