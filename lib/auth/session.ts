import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import type { UserRole } from "@/types";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAdmin(redirectTo = "/admin/login") {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect(redirectTo);
  }
  return session.user;
}

export async function requireCustomer(redirectTo = "/login") {
  const session = await getSession();
  if (!session?.user || session.user.role !== "customer") {
    redirect(redirectTo);
  }
  return session.user;
}

export async function requireRole(
  role: UserRole,
  redirectTo?: string
) {
  if (role === "admin") {
    return requireAdmin(redirectTo);
  }
  return requireCustomer(redirectTo);
}
