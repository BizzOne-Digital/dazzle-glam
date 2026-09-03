import { AnimatedLegalLayout } from "@/components/animations/AnimatedLegalLayout";
import { demoProducts } from "@/lib/data/demo";

export const metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  const images = demoProducts.slice(0, 3).map((p) => p.images[0]);
  return (
    <AnimatedLegalLayout
      title="Accessibility Statement"
      images={images}
    >
      <p>
        Dazzle Glam is committed to an inclusive shopping experience. We aim to meet Canadian Government Legislation
        guidelines with semantic HTML, keyboard navigation, visible focus states, and reduced-motion
        support.
      </p>
      <p>
        If you encounter a barrier, email dazzleglamcollection@gmail.com and we will work to
        resolve it.
      </p>
    </AnimatedLegalLayout>
  );
}
