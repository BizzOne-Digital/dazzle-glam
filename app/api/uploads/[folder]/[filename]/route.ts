import { NextResponse } from "next/server";
import { getFolderUpload } from "@/lib/upload/store";

export const runtime = "nodejs";

type Params = { params: Promise<{ folder: string; filename: string }> };

function toBuffer(data: unknown): Buffer {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return Buffer.from(data);
  if (data && typeof data === "object" && "buffer" in data) {
    const inner = (data as { buffer: ArrayBuffer | Buffer | Uint8Array }).buffer;
    if (Buffer.isBuffer(inner)) return inner;
    if (inner instanceof Uint8Array) return Buffer.from(inner);
    return Buffer.from(new Uint8Array(inner));
  }
  throw new Error("Invalid image data");
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { folder, filename } = await params;

    if (
      !folder ||
      !filename ||
      filename.includes("..") ||
      folder.includes("..") ||
      filename.includes("/")
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const doc = await getFolderUpload(folder, filename);
    if (!doc?.data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = toBuffer(doc.data);
    const bytes = new Uint8Array(body);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "image/jpeg",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[uploads serve]", error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
