import { NextRequest, NextResponse } from "next/server";
import { getPageContent } from "@/actions/pageContent";
import {
  defaultPageContent,
  resolveContentImage,
} from "@/lib/content/defaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sanitizeSections(
  pageKey: string,
  sections: Record<string, Record<string, unknown>> | undefined
) {
  if (!sections) return sections;
  const defaults = defaultPageContent[pageKey] || {};
  const next: Record<string, Record<string, unknown>> = {};

  for (const [sectionKey, fields] of Object.entries(sections)) {
    const defaultSection = defaults[sectionKey] || {};
    const cleaned: Record<string, unknown> = { ...fields };
    for (const [field, value] of Object.entries(fields)) {
      if (
        typeof value === "string" &&
        (field === "image" || field.endsWith("Image") || field.includes("image"))
      ) {
        const fallback =
          typeof defaultSection[field] === "string"
            ? (defaultSection[field] as string)
            : "/images/hero/campaign.png";
        cleaned[field] = resolveContentImage(value, fallback || "/images/hero/campaign.png");
      }
    }
    next[sectionKey] = cleaned;
  }

  return next;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    const { pageKey } = await params;
    const content = await getPageContent(pageKey);

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    const payload = {
      ...content,
      sections: sanitizeSections(pageKey, content.sections),
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
