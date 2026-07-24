"use server";

import { connectDB } from "@/lib/db/connect";
import { PageContent } from "@/models/Content";
import { revalidatePath } from "next/cache";

export async function getPageContent(pageKey: string) {
  try {
    await connectDB();
    const content = await PageContent.findOne({ pageKey, isPublished: true }).lean();
    
    if (!content) {
      return null;
    }

    return JSON.parse(JSON.stringify(content));
  } catch (error) {
    console.error(`Error fetching page content for ${pageKey}:`, error);
    return null;
  }
}

export async function getAllPageContents() {
  try {
    await connectDB();
    const contents = await PageContent.find({}).sort({ pageKey: 1 }).lean();
    return JSON.parse(JSON.stringify(contents));
  } catch (error) {
    console.error("Error fetching all page contents:", error);
    return [];
  }
}

export async function updatePageContent(pageKey: string, data: {
  sections?: any;
  seo?: any;
  isPublished?: boolean;
}) {
  try {
    await connectDB();
    
    const updated = await PageContent.findOneAndUpdate(
      { pageKey },
      { 
        $set: data,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    ).lean();

    // Revalidate specific paths and the API route
    revalidatePath(`/api/content/${pageKey}`, "page");
    revalidatePath("/", "layout");
    
    // Also revalidate specific page routes
    switch (pageKey) {
      case "home":
        revalidatePath("/", "page");
        break;
      case "contact":
        revalidatePath("/contact", "page");
        break;
      case "about":
        revalidatePath("/about", "page");
        break;
      case "faq":
        revalidatePath("/faq", "page");
        break;
      case "shop":
        revalidatePath("/shop", "page");
        break;
      default:
        revalidatePath(`/${pageKey}`, "page");
    }
    
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(updated)) 
    };
  } catch (error: any) {
    console.error(`Error updating page content for ${pageKey}:`, error);
    return { 
      success: false, 
      error: error.message || "Failed to update page content" 
    };
  }
}

export async function createOrUpdatePageContent(pageKey: string, sections: any, seo: any) {
  return updatePageContent(pageKey, { sections, seo, isPublished: true });
}
