import { AnimatedLegalLayout } from "@/components/animations/AnimatedLegalLayout";
import { demoProducts } from "@/lib/data/demo";

export const metadata = { title: "Returns & Refunds" };

export default function ReturnsPage() {
  const images = demoProducts.slice(9, 12).map((p) => p.images[0]);
  return (
    <AnimatedLegalLayout title="Returns & Refunds" images={images}>
      <p>
        Unworn items in original packaging may be returned within 14 days of delivery. Contact us
        with your order number to start a return.
      </p>
      <p>Refunds are issued to the original payment method once the return is inspected.</p>
    </AnimatedLegalLayout>
  );
}
