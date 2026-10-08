/**
 * Enable Shop pin + free shipping on silicone fundraising bracelets.
 * Run: npx tsx scripts/applyFundraisingProduct.ts
 */
import { connectDB } from "../lib/db/connect";
import { Product } from "../models/Product";
import { FUNDRAISING_PRODUCT_NAME_PATTERN } from "../config/site";

async function main() {
  await connectDB();
  const matches = await Product.find({
    $or: [
      { name: FUNDRAISING_PRODUCT_NAME_PATTERN },
      { slug: FUNDRAISING_PRODUCT_NAME_PATTERN },
    ],
  });

  if (!matches.length) {
    console.log("No products matched silicone fundraising pattern.");
    process.exit(0);
  }

  for (const product of matches) {
    product.pinToShopTop = true;
    product.freeShipping = true;
    await product.save();
    console.log(`Updated: ${product.name} (${product.slug})`);
  }

  console.log(`Done. ${matches.length} product(s) updated.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
