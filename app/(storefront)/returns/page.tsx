import { AnimatedLegalLayout } from "@/components/animations/AnimatedLegalLayout";
import { placeholderImages } from "@/config/site";

export const metadata = { title: "Returns & Refunds" };

export default function ReturnsPage() {
  return (
    <AnimatedLegalLayout title="Returns & Refunds" images={placeholderImages.earrings.slice(0, 3)}>
      <p>
        Unworn items in original packaging may be returned within 14 days of delivery. Contact us
        with your order number to start a return.
      </p>
      <p>Refunds are issued to the original payment method once the return is inspected.</p>
    </AnimatedLegalLayout>
  );
}
