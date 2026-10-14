import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      email: string;
      name: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    email: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    email: string;
    name: string;
  }
}
