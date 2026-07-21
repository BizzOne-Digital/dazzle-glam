import { AnimatedLegalLayout } from "@/components/animations/AnimatedLegalLayout";
import { placeholderImages } from "@/config/site";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <AnimatedLegalLayout title="Privacy Policy" images={placeholderImages.gallery.slice(0, 3)}>
      <p>Last updated: July 2026</p>
      <p>
        Dazzle Glam Jewelry Collection (&quot;we&quot;, &quot;us&quot;) respects your privacy. This
        policy explains how we collect, use, and protect personal information when you shop at
        dazzleglamjewelry.ca.
      </p>
      <h2 className="font-heading text-2xl text-white">Information We Collect</h2>
      <p>
        Account details, order information, contact form submissions, newsletter subscriptions, and
        technical data such as device and browser type.
      </p>
      <h2 className="font-heading text-2xl text-white">How We Use Information</h2>
      <p>
        To process orders, provide customer support, improve our storefront, and send marketing
        communications when you consent.
      </p>
      <h2 className="font-heading text-2xl text-white">Contact</h2>
      <p>
        Questions? Email dazzleglamcollection@gmail.com or call (416) 305-7500.
      </p>
    </AnimatedLegalLayout>
  );
}
