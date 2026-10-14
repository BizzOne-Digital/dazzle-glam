import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { hashPassword } from "@/lib/auth/password";
import { AdminUser } from "@/models";

/**
 * One-time / emergency admin password sync for production.
 * POST with header: x-bootstrap-secret: <ADMIN_BOOTSTRAP_SECRET>
 * Sets password from ADMIN_SEED_EMAIL + ADMIN_SEED_PASSWORD env vars.
 */
export async function POST(request: Request) {
  const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!bootstrapSecret) {
    return NextResponse.json(
      { error: "ADMIN_BOOTSTRAP_SECRET is not configured" },
      { status: 503 }
    );
  }

  const provided = request.headers.get("x-bootstrap-secret");
  if (!provided || provided !== bootstrapSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: "ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set" },
      { status: 400 }
    );
  }

  if (password.length < 10) {
    return NextResponse.json(
      { error: "ADMIN_SEED_PASSWORD must be at least 10 characters" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const hashed = await hashPassword(password);
    const existing = await AdminUser.findOne({ email });

    if (existing) {
      existing.password = hashed;
      existing.isActive = true;
      await existing.save();
      return NextResponse.json({
        success: true,
        message: `Password updated for ${email}`,
      });
    }

    await AdminUser.create({
      name: "Dazzle Glam Admin",
      email,
      password: hashed,
      role: "admin",
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: `Admin created for ${email}`,
    });
  } catch (err) {
    console.error("sync-password failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
