import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import { calculateQuantityBreakTotal, normalizeQuantityPriceBreaks } from "@/lib/pricing/quantityBreaks";

export type CheckoutLineInput = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  quantityPriceBreaks?: Array<{ quantity: number; price: number }>;
  image?: string;
  variantLabel?: string;
  sku?: string;
};

export type PricedCheckoutLine = CheckoutLineInput & {
  lineTotal: number;
};

function parseProductId(cartLineId: string): string | null {
  const raw = (cartLineId || "").trim();
  if (!raw) return null;
  const productId = raw.includes("::") ? raw.split("::")[0] : raw;
  return productId || null;
}

export async function priceCheckoutLines(
  items: CheckoutLineInput[]
): Promise<{ subtotal: number; lines: PricedCheckoutLine[] }> {
  const productIds = [
    ...new Set(
      items
        .map((item) => parseProductId(item.id))
        .filter((id): id is string => !!id && mongoose.isValidObjectId(id))
    ),
  ];

  const productMap = new Map<
    string,
    { price: number; quantityPriceBreaks: Array<{ quantity: number; price: number }> }
  >();

  if (productIds.length) {
    try {
      await connectDB();
      const docs = await Product.find({ _id: { $in: productIds } })
        .select("price quantityPriceBreaks")
        .lean();
      for (const doc of docs) {
        productMap.set(String(doc._id), {
          price: Number(doc.price) || 0,
          quantityPriceBreaks: normalizeQuantityPriceBreaks(
            (doc.quantityPriceBreaks as Array<{ quantity: number; price: number }>) ||
              []
          ),
        });
      }
    } catch (error) {
      console.error("priceCheckoutLines:", error);
    }
  }

  const lines: PricedCheckoutLine[] = items.map((item) => {
    const productId = parseProductId(item.id);
    const fromDb = productId ? productMap.get(productId) : undefined;
    const unitPrice = fromDb?.price ?? (Number(item.price) || 0);
    const breaks =
      fromDb?.quantityPriceBreaks?.length
        ? fromDb.quantityPriceBreaks
        : normalizeQuantityPriceBreaks(item.quantityPriceBreaks);
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const lineTotal = calculateQuantityBreakTotal(unitPrice, quantity, breaks);
    return {
      ...item,
      price: unitPrice,
      quantity,
      quantityPriceBreaks: breaks,
      lineTotal,
    };
  });

  const subtotal = Math.round(
    lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100
  ) / 100;

  return { subtotal, lines };
}
