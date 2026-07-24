import { connectDB } from "../lib/db/connect";
import { SiteSettings } from "../models/SiteSettings";

async function updateSettings() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Updating site settings...");
    
    const result = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          phone: "(416) 905-7500",
          instagramUrl: "https://www.instagram.com/dazzleglamcollection",
          facebookUrl: "https://www.facebook.com/dazzleglamcollection",
        }
      },
      { upsert: true, new: true }
    );

    console.log("✓ Settings updated:");
    console.log(`  Phone: ${result.phone}`);
    console.log(`  Instagram: ${result.instagramUrl}`);
    console.log(`  Facebook: ${result.facebookUrl}`);
    
    console.log("\n✅ Settings updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating settings:", error);
    process.exit(1);
  }
}

updateSettings();
