import { HomeExperience } from "@/components/home/HomeExperience";
import { getPageSections, sectionText } from "@/lib/content/defaults";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sections = await getPageSections("home");

  return (
    <HomeExperience
      heroContent={{
        eyebrow: sectionText(sections, "hero", "eyebrow", "Dazzle Glam Jewelry Collection"),
        title: sectionText(sections, "hero", "title", "Turn Heads."),
        scriptTitle: sectionText(sections, "hero", "scriptTitle", "Own the Room."),
        description: sectionText(
          sections,
          "hero",
          "description",
          "Eye-popping jewelry designed to command attention, amplify your confidence and transform every look into a bold statement."
        ),
        image: sectionText(sections, "hero", "image", "/images/hero/campaign.png"),
        primaryCta: sectionText(sections, "hero", "primaryCta", "Shop New Arrivals"),
        primaryHref: sectionText(sections, "hero", "primaryHref", "/shop?sort=new"),
        secondaryCta: sectionText(sections, "hero", "secondaryCta", ""),
        secondaryHref: sectionText(sections, "hero", "secondaryHref", "/shop"),
      }}
    />
  );
}
