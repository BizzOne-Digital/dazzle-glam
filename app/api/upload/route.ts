import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api";
import { saveFolderUpload } from "@/lib/upload/store";
import type { UploadFolder } from "@/models/Upload";

export const runtime = "nodejs";

const FOLDERS = new Set<UploadFolder>([
  "gallery",
  "products",
  "pages",
  "misc",
]);

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const folderRaw = String(form.get("folder") || "misc");
    const folder = FOLDERS.has(folderRaw as UploadFolder)
      ? (folderRaw as UploadFolder)
      : "misc";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const saved = await saveFolderUpload(file, folder);
    return NextResponse.json({ success: true, ...saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
