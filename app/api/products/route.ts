import { NextResponse } from "next/server";
import { getPublishedProducts } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getPublishedProducts();
  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
