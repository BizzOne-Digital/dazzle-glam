import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { placeholderImages } from "@/config/site";

export default function CheckoutSuccessPage() {
  return (
    <div className="relative min-h-[80vh] pb-20 pt-8">
      <div className="absolute inset-0 grid grid-cols-4 opacity-20">
        {placeholderImages.rings.slice(0, 4).map((src) => (
          <div key={src} className="relative">
            <Image src={src} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
      <Container className="relative z-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia">Order Confirmed</p>
        <h1 className="mt-3 font-heading text-3xl text-white sm:text-5xl md:text-6xl">
          You&apos;re About to Dazzle
        </h1>
        <p className="mx-auto mt-4 max-w-md px-1 text-white/60">
          Thank you for your order. A confirmation email is on its way. Get ready to turn heads.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/account">View Account</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
