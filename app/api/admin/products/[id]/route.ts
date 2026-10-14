import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api";
import { getAdminProductById } from "@/lib/products/queries";
import { deleteProductAdmin, updateProductAdmin } from "@/actions/products";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const body = await request.json();
  const result = await updateProductAdmin(id, body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const result = await deleteProductAdmin(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
