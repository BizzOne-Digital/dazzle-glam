import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/connect";
import { verifyPassword } from "@/lib/auth/password";
import { AdminUser, Customer, type IAdminUser, type ICustomer } from "@/models";
import type { UserRole } from "@/types";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const portal = credentials.portal?.toLowerCase();

        await connectDB();

        if (portal === "admin" || !portal) {
          const admin = (await AdminUser.findOne({
            email,
            isActive: true,
          }).lean()) as IAdminUser | null;

          if (admin?.password) {
            const valid = await verifyPassword(
              credentials.password,
              admin.password
            );
            if (valid) {
              await AdminUser.updateOne(
                { _id: admin._id },
                { $set: { lastLoginAt: new Date() } }
              );
              return {
                id: String(admin._id),
                email: admin.email,
                name: admin.name,
                role: "admin" as UserRole,
              };
            }
          }
          if (portal === "admin") {
            return null;
          }
        }

        if (portal === "customer" || !portal) {
          const customer = (await Customer.findOne({
            email,
            isDisabled: false,
          }).lean()) as ICustomer | null;

          if (customer?.password) {
            const valid = await verifyPassword(
              credentials.password,
              customer.password
            );
            if (valid) {
              return {
                id: String(customer._id),
                email: customer.email,
                name: customer.name,
                role: "customer" as UserRole,
              };
            }
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
