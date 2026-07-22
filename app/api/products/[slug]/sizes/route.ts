import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ProductSizes } from "@/models/ProductSizes";
import { demoProducts } from "@/lib/data/demo";

/**
 * GET /api/products/[slug]/sizes
 * Returns the live sizes for a product.
 * Checks MongoDB for admin-set sizes first; falls back to demo data (empty).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const demo = demoProducts.find((p) => p.slug === slug);
  if (!demo) {
    return NextResponse.json({ sizes: [] });
  }

  try {
    await connectDB();
    const doc = await ProductSizes.findOne({ productId: demo.id }).lean() as
      | { sizes: string[] }
      | null;

    // If a doc exists (even with empty sizes), use it — admin has touched this product
    if (doc !== null) {
      return NextResponse.json({ sizes: doc.sizes ?? [] });
    }
  } catch {
    // DB not connected — fall through
  }

  // No DB record yet → fall back to demo data (currently empty for all products)
  return NextResponse.json({ sizes: demo.sizes });
}
