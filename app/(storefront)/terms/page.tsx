import { AnimatedLegalLayout } from "@/components/animations/AnimatedLegalLayout";
import { placeholderImages } from "@/config/site";

export const metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return (
    <AnimatedLegalLayout title="Terms & Conditions" images={placeholderImages.rings.slice(0, 3)}>
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
