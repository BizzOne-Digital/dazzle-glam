import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import { ProductSizes } from "@/models/ProductSizes";
import { demoProducts } from "@/lib/data/demo";
import { parseWidthSizesMap } from "@/lib/productWidthSizes";
import type { WidthVariant } from "@/lib/productSizes";

type SizesDoc = {
  sizes?: string[];
  widthSizes?: unknown;
};

/**
 * GET /api/products/[slug]/sizes
 * Returns admin-managed sizes. Optional ?width=4mm for per-width ring sizes.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const widthParam = searchParams.get("width")?.trim() || "";
  const demo = demoProducts.find((p) => p.slug === slug);

  let widthVariants: WidthVariant[] = demo?.widthVariants || [];

  try {
    await connectDB();

    const product = await Product.findOne({ slug }).select("widthVariants").lean();
    if (product?.widthVariants?.length) {
      widthVariants = product.widthVariants.map((w) => ({
        width: w.width,
        image: w.image || undefined,
      }));
    }

    const bySlug = (await ProductSizes.findOne({ productSlug: slug }).lean()) as
      | SizesDoc
      | null;

    if (bySlug) {
      const widthSizes = parseWidthSizesMap(bySlug.widthSizes);
      const hasWidthVariants = widthVariants.length > 0;

      if (hasWidthVariants) {
        if (widthParam) {
          return NextResponse.json({
            sizes: widthSizes[widthParam] ?? [],
            widthSizes,
            hasWidthVariants: true,
            widthVariants,
          });
        }
        return NextResponse.json({
          sizes: [],
          widthSizes,
          hasWidthVariants: true,
          widthVariants,
        });
      }

      return NextResponse.json({
        sizes: bySlug.sizes ?? [],
        hasWidthVariants: false,
      });
    }

    if (demo) {
      const byDemoId = (await ProductSizes.findOne({ productId: demo.id }).lean()) as
        | SizesDoc
        | null;
      if (byDemoId) {
        const widthSizes = parseWidthSizesMap(byDemoId.widthSizes);
        const hasWidthVariants = widthVariants.length > 0;

        if (hasWidthVariants) {
          if (widthParam) {
            return NextResponse.json({
              sizes: widthSizes[widthParam] ?? [],
              widthSizes,
              hasWidthVariants: true,
              widthVariants,
            });
          }
          return NextResponse.json({
            sizes: [],
            widthSizes,
            hasWidthVariants: true,
            widthVariants,
          });
        }

        return NextResponse.json({
          sizes: byDemoId.sizes ?? [],
          hasWidthVariants: false,
        });
      }
    }
  } catch {
    // DB not connected — fall through
  }

  const hasWidthVariants = widthVariants.length > 0;
  if (hasWidthVariants) {
    return NextResponse.json({
      sizes: widthParam ? [] : [],
      widthSizes: {},
      hasWidthVariants: true,
      widthVariants,
    });
  }

  return NextResponse.json({
    sizes: demo?.sizes ?? [],
    hasWidthVariants: false,
  });
}
