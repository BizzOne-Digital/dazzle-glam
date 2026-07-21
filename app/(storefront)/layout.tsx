"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { IntroSplash } from "@/components/animations/IntroSplash";
import { IntroProvider, useIntro } from "@/components/animations/IntroProvider";
import { PageTransition } from "@/components/animations/PageTransition";
import { announcementDefaults } from "@/config/site";
import { cn } from "@/lib/utils";

function StorefrontShell({ children }: { children: React.ReactNode }) {
  const { showIntro, introReady } = useIntro();
  const pathname = usePathname();
  const hideChrome = !introReady || showIntro;
  /** Home hero is full-bleed under the fixed header — no main top padding */
  const isHome = pathname === "/";

  return (
    <>
      <IntroSplash />

      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[70] overflow-visible transition-opacity duration-300",
          hideChrome
            ? "pointer-events-none opacity-0"
            : "pointer-events-auto opacity-100"
        )}
        aria-hidden={hideChrome}
      >
        <AnnouncementBar messages={[...announcementDefaults]} />
        <Header />
      </div>

      <PageTransition />
      <main
        id="main-content"
        className={cn(
          "min-h-screen transition-[padding] duration-300",
          hideChrome || isHome ? "pt-0" : "pt-[6.5rem] sm:pt-[7.25rem]"
        )}
      >
        {children}
      </main>

      <div className={cn(hideChrome && "invisible")} aria-hidden={hideChrome}>
        <Footer />
      </div>
    </>
  );
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IntroProvider>
      <StorefrontShell>{children}</StorefrontShell>
    </IntroProvider>
  );
}
