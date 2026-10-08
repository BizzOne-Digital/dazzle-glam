"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { getCurrentUser } from "@/lib/auth/session";
import { Customer, Product, Wishlist } from "@/models";
import type { ActionResult } from "@/actions/auth";

const WISHLIST_COOKIE = "dg_wishlist_sid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

async function getOrCreateWishlistSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(WISHLIST_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = randomUUID();
  jar.set(WISHLIST_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return sessionId;
}

export async function toggleWishlist(
  productId: string
): Promise<ActionResult<{ inWishlist: boolean; count: number }>> {
  if (!productId || !/^[a-f\d]{24}$/i.test(productId)) {
    return { success: false, message: "Invalid product" };
  }

  await connectDB();

  const product = (await Product.findOne({
    _id: productId,
    status: "published",
  }).lean()) as { _id: Types.ObjectId; slug: string } | null;

  if (!product) {
    return { success: false, message: "Product not found" };
  }

  const user = await getCurrentUser();

  if (user?.role === "customer") {
    const customer = await Customer.findById(user.id);
    if (!customer || customer.isDisabled) {
      return { success: false, message: "Please sign in to save favorites" };
    }

    const index = customer.wishlist.findIndex(
      (id: Types.ObjectId) => String(id) === productId
    );
    let inWishlist: boolean;

    if (index >= 0) {
      customer.wishlist.splice(index, 1);
      inWishlist = false;
    } else {
      customer.wishlist.push(product._id);
      inWishlist = true;
    }

    await customer.save();
    revalidatePath("/wishlist");
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      message: inWishlist ? "Saved to wishlist" : "Removed from wishlist",
      data: {
        inWishlist,
        count: customer.wishlist.length,
      },
    };
  }

  const sessionId = await getOrCreateWishlistSessionId();
  let wishlist = await Wishlist.findOne({ sessionId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ sessionId, products: [] });
  }

  const index = wishlist.products.findIndex(
    (id: Types.ObjectId) => String(id) === productId
  );
  let inWishlist: boolean;

  if (index >= 0) {
    wishlist.products.splice(index, 1);
    inWishlist = false;
  } else {
    wishlist.products.push(product._id);
    inWishlist = true;
  }

  await wishlist.save();
  revalidatePath("/wishlist");
  revalidatePath(`/products/${product.slug}`);

  return {
    success: true,
    message: inWishlist ? "Saved to wishlist" : "Removed from wishlist",
    data: {
      inWishlist,
      count: wishlist.products.length,
    },
  };
}
