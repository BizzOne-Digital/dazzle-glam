import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models/Commerce";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    await connectDB();
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    const payload = orders.map((o) => {
      const row = JSON.parse(JSON.stringify(o));
      row._id = String(o._id);
      return row;
    });
    return NextResponse.json({ orders: payload });
  } catch (err) {
    console.error("admin orders:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
