import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/connect";
import { Customer } from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    await connectDB();
    const customers = await Customer.find({})
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const payload = customers.map((c) => ({
      _id: String(c._id),
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      orderCount: c.orderCount || 0,
      totalSpent: c.totalSpent || 0,
      isDisabled: !!c.isDisabled,
      notes: c.notes || "",
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ customers: payload });
  } catch (err) {
    console.error("admin customers:", err);
    return NextResponse.json(
      { error: "Failed to load customers" },
      { status: 500 }
    );
  }
}
