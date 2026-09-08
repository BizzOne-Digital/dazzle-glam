import { AnimatedLegalLayout } from "@/components/animations/AnimatedLegalLayout";
import { demoProducts } from "@/lib/data/demo";
import {
  STANDARD_SHIPPING_COST,
  USA_STANDARD_SHIPPING_COST,
} from "@/lib/shipping";

export const metadata = { title: "Shipping Policy" };

export default function ShippingPage() {
  const images = demoProducts.slice(6, 9).map((p) => p.images[0]);
  return (
    <AnimatedLegalLayout title="Shipping Policy" images={images}>
      <p>We ship across Canada and the United States with tracked delivery options.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Canada — Standard: 4–7 days (${STANDARD_SHIPPING_COST.toFixed(2)})</li>
        <li>
          United States — Standard Shipping to USA: 5–10 business days ($
          {USA_STANDARD_SHIPPING_COST.toFixed(2)})
        </li>
        <li>Canada — Express: 2–4 business days</li>
        <li>Free standard shipping on qualifying Canadian orders (threshold configurable in admin)</li>
      </ul>
      <p>Most orders leave our studio within 2–4 business days.</p>
    </AnimatedLegalLayout>
  );
}
