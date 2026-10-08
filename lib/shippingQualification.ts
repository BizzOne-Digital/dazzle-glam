import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import {
  cartQualifiesForProductFreeShipping,
  productQualifiesForFreeShipping,
} from "@/lib/products/promotions";

function parseProductIdFromCartKey(id: string): string | null {
  const raw = (id || "").trim();
  if (!raw) return null;
  const productId = raw.includes("::") ? raw.split("::")[0] : raw;
  return productId || null;
}

export async function orderQualifiesForProductFreeShipping(
  items: Array<{ id?: string; name?: string; freeShipping?: boolean }>
): Promise<boolean> {
  if (cartQualifiesForProductFreeShipping(items)) return true;

  const ids = [
    ...new Set(
      items
        .map((item) => parseProductIdFromCartKey(item.id || ""))
        .filter((id): id is string => !!id && mongoose.isValidObjectId(id))
    ),
  ];
  if (!ids.length) return false;

  try {
    await connectDB();
    const products = await Product.find({ _id: { $in: ids } })
      .select("name slug sku materials freeShipping pinToShopTop")
      .lean();
    return products.some((p) =>
      productQualifiesForFreeShipping({
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        materials: p.materials as string[] | undefined,
        freeShipping: !!p.freeShipping,
      })
    );
  } catch (error) {
    console.error("orderQualifiesForProductFreeShipping:", error);
    return false;
  }
}
