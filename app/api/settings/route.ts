import { NextResponse } from "next/server";
import { getSiteSettings } from "@/actions/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  const result = await getSiteSettings();
  
  if (result.success && result.data) {
    return NextResponse.json(result.data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
  
  return NextResponse.json(
    { error: "Failed to load settings" },
    { status: 500 }
  );
}
