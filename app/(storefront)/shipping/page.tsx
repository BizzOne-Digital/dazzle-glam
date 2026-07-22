import { AnimatedLegalLayout } from "@/components/animations/AnimatedLegalLayout";
import { demoProducts } from "@/lib/data/demo";

export const metadata = { title: "Shipping Policy" };

export default function ShippingPage() {
  const images = demoProducts.slice(6, 9).map((p) => p.images[0]);
  return (
    <AnimatedLegalLayout title="Shipping Policy" images={images}>
      <p>We ship Canada-wide with tracked delivery options.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Standard: 3–6 business days</li>
        <li>Express: 1–3 business days</li>
        <li>Free shipping on qualifying orders (threshold configurable in admin)</li>
      </ul>
      <p>Most orders leave our studio within 2–4 business days.</p>
    </AnimatedLegalLayout>
  );
}
