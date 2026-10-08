"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminLoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/admin";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      portal: "admin",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid credentials");
      return;
    }
    router.push(callbackUrl);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-silver/20 bg-charcoal p-8 shadow-[0_0_60px_rgb(255_20_147/0.15)]">
        <div className="mb-8 flex justify-center">
          <Image
            src="/brand/logo.png"
            alt="Dazzle Glam"
            width={180}
            height={60}
            className="h-14 w-auto"
          />
        </div>
        <h1 className="text-center font-heading text-3xl">Admin Access</h1>
        <p className="mt-2 text-center text-sm text-white/45">
          Secure portal for store management
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Input name="email" type="email" required placeholder="Email" autoComplete="username" />
          <Input
            name="password"
            type="password"
            required
            placeholder="Password"
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
