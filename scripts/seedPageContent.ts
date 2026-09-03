import { connectDB } from "../lib/db/connect";
import { PageContent } from "../models/Content";
import { defaultPageContent } from "../lib/content/defaults";

async function main() {
  await connectDB();
  console.log("Seeding page content…");

  for (const [pageKey, sections] of Object.entries(defaultPageContent)) {
    await PageContent.findOneAndUpdate(
      { pageKey },
      {
        $set: {
          pageKey,
          sections,
          seo: {
            title: `${pageKey.charAt(0).toUpperCase()}${pageKey.slice(1)} | Dazzle Glam`,
            description: String(
              (sections.hero as { description?: string } | undefined)?.description ||
                "Dazzle Glam Jewelry Collection"
            ),
            keywords: ["dazzle glam", "statement jewelry", pageKey],
          },
          isPublished: true,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ ${pageKey}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
