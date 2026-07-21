import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { placeholderImages } from "@/config/site";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <Image
        src={placeholderImages.hero[1]}
        alt=""
        fill
        className="object-cover opacity-30 blur-sm"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-fuchsia/30" />
      <Container className="relative z-10 text-center">
        <h2 className="font-heading text-3xl text-white md:text-6xl lg:text-7xl">
          Your Next Statement Starts Here
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-white/60">
          Sophisticated style. High-glam designs. Jewelry created to amplify your character.
        </p>
        <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/shop">Shop All Jewelry</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link href="/shop?sort=new">Explore New Arrivals</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
