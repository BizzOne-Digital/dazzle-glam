import { HomeExperience } from "@/components/home/HomeExperience";
import { getPageSections, sectionImage, sectionText } from "@/lib/content/defaults";

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
        image: sectionImage(
          sections,
          "hero",
          "image",
          "/images/hero/campaign.png"
        ),
        primaryCta: sectionText(sections, "hero", "primaryCta", "Shop New Arrivals"),
        primaryHref: sectionText(sections, "hero", "primaryHref", "/shop?sort=new"),
        secondaryCta: sectionText(sections, "hero", "secondaryCta", ""),
        secondaryHref: sectionText(sections, "hero", "secondaryHref", "/shop"),
      }}
      showcaseContent={{
        label: sectionText(sections, "showcase", "label", "Our work in motion"),
        body: sectionText(
          sections,
          "showcase",
          "body",
          "Dazzle Glam turns everyday looks into *statement moments* — bold pieces designed to amplify confidence and own every room."
        ),
        feature1Title: sectionText(
          sections,
          "showcase",
          "feature1Title",
          "Statement Design"
        ),
        feature1Description: sectionText(
          sections,
          "showcase",
          "feature1Description",
          "Pieces that command attention from across the room."
        ),
        feature2Title: sectionText(
          sections,
          "showcase",
          "feature2Title",
          "Everyday Glam"
        ),
        feature2Description: sectionText(
          sections,
          "showcase",
          "feature2Description",
          "High-fashion energy made for real life."
        ),
      }}
    />
  );
}
