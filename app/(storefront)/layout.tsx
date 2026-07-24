"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { announcementDefaults } from "@/config/site";
import { cn } from "@/lib/utils";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  /** Home hero is full-bleed under the fixed header — no main top padding */
  const isHome = pathname === "/";

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[70] overflow-visible">
        <AnnouncementBar messages={[...announcementDefaults]} />
        <Header />
      </div>

      <main
        id="main-content"
        className={cn(
          "min-h-screen",
          isHome ? "pt-0" : "pt-[6.5rem] sm:pt-[7.25rem]"
        )}
      >
        {children}
      </main>

      <Footer />
    </>
  );
}
