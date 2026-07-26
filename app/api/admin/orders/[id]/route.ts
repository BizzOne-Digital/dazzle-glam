import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models/Commerce";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const { id } = await params;
    await connectDB();
    const { id } = await params;

    let order = null;
    if (/^[a-f\d]{24}$/i.test(id)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id }).lean();
    }
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const payload = JSON.parse(JSON.stringify(order));
    payload._id = String(order._id);

    return NextResponse.json({ order: payload });
  } catch (err) {
    console.error("admin order:", err);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}
