"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/cart/CartDrawer";

export interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
      <CartDrawer />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "glass-strong border border-white/10 text-white font-body shadow-[0_16px_48px_rgb(0_0_0/0.45)]",
            title: "font-body text-sm text-white",
            description: "text-white/55",
            success: "[&_[data-icon]]:text-fuchsia",
            error: "[&_[data-icon]]:text-red-400",
          },
        }}
        richColors={false}
        closeButton
      />
    </SessionProvider>
  );
}
