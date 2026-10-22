/**
 * Pin fundraising bracelet on Shop, free shipping, and 4 for $10 volume tier.
 * Run: npx tsx --env-file=.env scripts/applyFundraisingProduct.ts
 */
import { connectDB } from "../lib/db/connect";
import { Product } from "../models/Product";
import { FUNDRAISING_DEFAULT_QUANTITY_BREAKS } from "../config/site";
import {
  fundraisingPackProductMongoQuery,
  fundraisingProductMongoQuery,
} from "../lib/products/promotions";

async function main() {
  await connectDB();
  const matches = await Product.find(fundraisingProductMongoQuery());
  const packProducts = await Product.find(fundraisingPackProductMongoQuery());

  if (!matches.length) {
    console.log("No fundraising bracelet products matched (SKU AM1001, silicone, etc.).");
    process.exit(0);
  }

  for (const product of matches) {
    product.pinToShopTop = true;
    product.isFeatured = true;
    product.freeShipping = true;
    await product.save();
    console.log(
      `Promotions: ${product.name} (${product.slug}) SKU ${product.sku || "—"}`
    );
  }

  for (const product of packProducts) {
    if (!product.quantityPriceBreaks?.length) {
      product.quantityPriceBreaks = [...FUNDRAISING_DEFAULT_QUANTITY_BREAKS];
      await product.save();
      console.log(
        `Pack tiers: ${product.name} (${product.slug}) SKU ${product.sku || "—"}`
      );
    }
  }

  console.log(
    `Done. ${matches.length} promotion(s), ${packProducts.length} pack product(s) checked.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
