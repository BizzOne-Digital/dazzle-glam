import { AboutExperience } from "@/components/about/AboutExperience";
import { getPageSections, sectionText } from "@/lib/content/defaults";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us",
  description:
    "The story behind Dazzle Glam Jewelry Collection — bold jewelry for women who refuse to blend in.",
};

export default async function AboutPage() {
  const sections = await getPageSections("about");
  return (
    <AboutExperience
      content={{
        hero: {
          eyebrow: sectionText(sections, "hero", "eyebrow", "Our Story"),
          title: sectionText(
            sections,
            "hero",
            "title",
            "Jewelry That Breaks the Mold"
          ),
          image: sectionText(
            sections,
            "hero",
            "image",
            "/images/hero/about-campaign.png"
          ),
        },
        mission: {
          eyebrow: sectionText(sections, "mission", "eyebrow", "Mission"),
          title: sectionText(
            sections,
            "mission",
            "title",
            "Amplify Character. Own the Room."
          ),
          description: sectionText(
            sections,
            "mission",
            "description",
            "We believe jewelry should break the mold, amplify character, and transform everyday moments into bold statements of artistic confidence."
          ),
          content: sectionText(sections, "mission", "content", ""),
          scriptLine: sectionText(sections, "mission", "scriptLine", "So glam it up!"),
        },
        founder: {
          eyebrow: sectionText(sections, "founder", "eyebrow", "Founder"),
          title: sectionText(sections, "founder", "title", "Karleen"),
          description: sectionText(sections, "founder", "description", ""),
        },
      }}
    />
  );
}
