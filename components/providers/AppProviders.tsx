"use client";

import { useEffect, type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/cart/CartDrawer";

export interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  // Suppress NextAuth fetch errors and hydration warnings in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args) => {
        // Suppress NextAuth CLIENT_FETCH_ERROR
        if (
          args[0]?.includes?.("[next-auth]") &&
          args[0]?.includes?.("CLIENT_FETCH_ERROR")
        ) {
          return;
        }
        // Suppress hydration errors caused by browser extensions (fdprocessedid)
        if (
          typeof args[0] === "string" &&
          (args[0].includes("Hydration failed") ||
           args[0].includes("hydrated but some attributes") ||
           args[0].includes("did not match") ||
           args[0].includes("fdprocessedid"))
        ) {
          return;
        }
        originalError.apply(console, args);
      };

      console.warn = (...args) => {
        // Suppress hydration warnings
        if (
          typeof args[0] === "string" &&
          (args[0].includes("Extra attributes from the server") ||
           args[0].includes("fdprocessedid"))
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };
      
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return (
    <SessionProvider 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
      basePath="/api/auth"
    >
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
