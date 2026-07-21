import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { placeholderImages } from "@/config/site";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 grid grid-cols-3 opacity-25">
        {placeholderImages.gallery.slice(0, 3).map((src) => (
          <div key={src} className="relative">
            <Image src={src} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/80" />
      <Container className="relative z-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.4em] text-fuchsia">404</p>
        <h1 className="mt-3 font-heading text-5xl text-white md:text-7xl">
          This Sparkle Got Lost
        </h1>
        <p className="mx-auto mt-4 max-w-md text-white/60">
          The page you&apos;re looking for slipped off the runway. Let&apos;s get you back to the glam.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
