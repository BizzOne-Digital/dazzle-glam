"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface UploadedImage {
  id: string;
  url: string;
  uploadedAt: Date;
  name?: string;
}

export default function AdminMediaPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [currentUpload, setCurrentUpload] = useState<string>("");

  const handleUploadComplete = (url: string) => {
    const newImage: UploadedImage = {
      id: Date.now().toString(),
      url,
      uploadedAt: new Date(),
      name: url.split("/").pop() || "Uploaded image",
    };
    setImages([newImage, ...images]);
    setCurrentUpload("");
    toast.success("Image uploaded successfully!");
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard");
  };

  const handleDelete = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
    toast.success("Image removed from list");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Media Library</h1>
          <p className="mt-1 text-sm text-white/50">
            Upload and manage images using Cloudinary
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 font-heading text-xl">Upload New Image</h2>
        <ImageUpload
          value={currentUpload}
          onChange={handleUploadComplete}
          onRemove={() => setCurrentUpload("")}
          label=""
        />
      </div>

      {/* Cloudinary Setup Instructions */}
      <div className="rounded-xl border border-fuchsia/20 bg-fuchsia/5 p-6">
        <h3 className="mb-3 font-heading text-lg text-white">
          📦 Cloudinary Setup Required
        </h3>
        <div className="space-y-3 text-sm text-white/70">
          <div>
            <p className="font-medium text-white">Step 1: Sign up for Cloudinary</p>
            <p className="mt-1">
              Go to{" "}
              <a
                href="https://cloudinary.com/users/register_free"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fuchsia underline"
              >
                cloudinary.com/users/register_free
              </a>{" "}
              and create a free account
            </p>
          </div>

          <div>
            <p className="font-medium text-white">Step 2: Get your credentials</p>
            <p className="mt-1">After login, go to Dashboard and copy:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>
                <strong>Cloud Name</strong>: Found in Dashboard URL
              </li>
              <li>
                <strong>API Key</strong>: Found in &quot;API Keys&quot; section
              </li>
              <li>
                <strong>API Secret</strong>: Found in &quot;API Keys&quot; section
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-white">Step 3: Create Upload Preset</p>
            <p className="mt-1">
              1. Go to Settings → Upload → Add upload preset
              <br />
              2. Name it: <code className="rounded bg-black/40 px-2 py-0.5">dazzle-glam</code>
              <br />
              3. Set Signing Mode to: <strong>Unsigned</strong>
              <br />
              4. Set Folder to: <code className="rounded bg-black/40 px-2 py-0.5">dazzle-glam</code>
              <br />
              5. Click Save
            </p>
          </div>

          <div>
            <p className="font-medium text-white">Step 4: Add to .env file</p>
            <p className="mt-1">Open your <code className="rounded bg-black/40 px-2 py-0.5">.env</code> file and fill in:</p>
            <pre className="mt-2 overflow-x-auto rounded bg-black/60 p-3 text-xs">
{`CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name`}
            </pre>
          </div>

          <div>
            <p className="font-medium text-white">Step 5: Restart dev server</p>
            <p className="mt-1">After adding credentials, restart your development server for changes to take effect</p>
          </div>
        </div>
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading text-xl">Uploaded Images ({images.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                  <Image
                    src={image.url}
                    alt={image.name || "Uploaded image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm text-white/70">{image.name}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {image.uploadedAt.toLocaleString()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyUrl(image.url)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(image.url, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(image.id)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-12 text-center">
          <p className="text-white/50">
            No images uploaded yet. Upload your first image above!
          </p>
        </div>
      )}
    </div>
  );
}
