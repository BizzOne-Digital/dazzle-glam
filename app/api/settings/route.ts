import { NextResponse } from "next/server";
import { getSiteSettings } from "@/actions/settings";

export async function GET() {
  const result = await getSiteSettings();
  
  if (result.success && result.data) {
    return NextResponse.json(result.data);
  }
  
  return NextResponse.json(
    { error: "Failed to load settings" },
    { status: 500 }
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
