import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api";
import { getAdminProducts } from "@/lib/products/queries";
import { createProductAdmin } from "@/actions/products";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const products = await getAdminProducts();
    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const body = await request.json();
    const result = await createProductAdmin(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
