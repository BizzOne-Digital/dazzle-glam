import { AnimatedLegalLayout } from "@/components/animations/AnimatedLegalLayout";
import { placeholderImages } from "@/config/site";

export const metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <AnimatedLegalLayout
      title="Accessibility Statement"
      images={placeholderImages.bracelets.slice(0, 3)}
    >
      <p>
        Dazzle Glam is committed to an inclusive shopping experience. We aim to meet WCAG 2.2 AA
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
