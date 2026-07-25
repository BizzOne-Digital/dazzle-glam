import { NextResponse } from "next/server";
import { getGalleryItems } from "@/actions/gallery";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getGalleryItems(true);
  return NextResponse.json(
    { items },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
