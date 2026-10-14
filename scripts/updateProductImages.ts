/**
 * Sync product image counts from demo catalog into MongoDB.
 * Most products → 3 images; exceptions stay at 2.
 */
import { connectDB } from "../lib/db/connect";
import { Product } from "../models/Product";
import { demoProducts } from "../lib/data/demo";

async function main() {
  await connectDB();
  let updated = 0;

  for (const demo of demoProducts) {
    const media = demo.images.map((url, i) => ({
      url,
      alt: demo.name,
      type: "image" as const,
      sortOrder: i,
    }));

    const result = await Product.updateOne(
      { slug: demo.slug },
      { $set: { media } }
    );

    if (result.modifiedCount || result.matchedCount) {
      updated += 1;
      console.log(`  ✓ ${demo.slug} → ${media.length} image(s)`);
    } else {
      console.log(`  · skipped (not in DB): ${demo.slug}`);
    }
  }

  console.log(`Done. Updated ${updated} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
