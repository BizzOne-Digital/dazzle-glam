import { AnimatedLegalLayout } from "@/components/animations/AnimatedLegalLayout";
import { demoProducts } from "@/lib/data/demo";

export const metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  const images = demoProducts.slice(3, 6).map((p) => p.images[0]);
  return (
    <AnimatedLegalLayout title="Terms & Conditions" images={images}>
      <p>By using Dazzle Glam Jewelry Collection websites and services, you agree to these terms.</p>
      <h2 className="font-heading text-2xl text-white">Orders &amp; Pricing</h2>
      <p>
        All prices are listed in CAD unless noted. We reserve the right to correct pricing errors
        and cancel orders affected by obvious mistakes.
      </p>
      <h2 className="font-heading text-2xl text-white">Intellectual Property</h2>
      <p>
        Brand assets, photography, and site content belong to Dazzle Glam Jewelry Collection and
        may not be reused without permission.
      </p>
    </AnimatedLegalLayout>
  );
}
