import { connectDB } from "../lib/db/connect";
import { SiteSettings } from "../models/SiteSettings";

async function testSave() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("✓ Connected to database");

    // Check existing settings
    console.log("\n1. Checking existing settings...");
    const settings = await SiteSettings.findOne();
    
    if (settings) {
      console.log("✓ Found existing settings:");
      console.log(`  Phone: ${settings.phone}`);
      console.log(`  Email: ${settings.email}`);
      console.log(`  Instagram: ${settings.instagramUrl}`);
    } else {
      console.log("⚠ No settings found in database");
    }

    // Try to update
    console.log("\n2. Updating settings...");
    const result = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          phone: "(416) 905-7500",
          email: "dazzleglamcollection@gmail.com",
          instagramUrl: "https://www.instagram.com/dazzleglamcollection",
          facebookUrl: "https://www.facebook.com/dazzleglamcollection",
        }
      },
      { upsert: true, new: true }
    );

    console.log("✓ Update successful!");
    console.log(`  Phone: ${result.phone}`);
    console.log(`  Email: ${result.email}`);
    console.log(`  Instagram: ${result.instagramUrl}`);
    console.log(`  Facebook: ${result.facebookUrl}`);

    // Verify by fetching again
    console.log("\n3. Verifying changes...");
    const verified = await SiteSettings.findOne();
    
    if (verified) {
      console.log("✓ Verified in database:");
      console.log(`  Phone: ${verified.phone}`);
      console.log(`  Email: ${verified.email}`);
      
      if (verified.phone === "(416) 905-7500") {
        console.log("\n✅ SUCCESS! Phone number is correctly saved!");
      } else {
        console.log("\n❌ ERROR! Phone number not saved correctly");
        console.log(`  Expected: (416) 905-7500`);
        console.log(`  Got: ${verified.phone}`);
      }
    }

    console.log("\n✅ Test completed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

testSave();
