import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ProductSizes } from "@/models/ProductSizes";
import { demoProducts } from "@/lib/data/demo";

/**
 * GET /api/products/[slug]/sizes
 * Returns admin-managed sizes for any product slug.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const demo = demoProducts.find((p) => p.slug === slug);

  try {
    await connectDB();

    // Preferred lookup: slug (works for both demo + Mongo products)
    const bySlug = (await ProductSizes.findOne({ productSlug: slug }).lean()) as
      | { sizes?: string[] }
      | null;
    if (bySlug) {
      return NextResponse.json({ sizes: bySlug.sizes ?? [] });
    }

    // Backward compatibility: older records stored by productId only
    if (demo) {
      const byDemoId = (await ProductSizes.findOne({ productId: demo.id }).lean()) as
        | { sizes?: string[] }
        | null;
      if (byDemoId) {
        return NextResponse.json({ sizes: byDemoId.sizes ?? [] });
      }
    }
  } catch {
    // DB not connected — fall through
  }

  // Fallback for demo catalog or unknown slug
  return NextResponse.json({ sizes: demo?.sizes ?? [] });
}
