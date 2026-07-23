"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  disabled?: boolean;
}

interface CloudinaryResult {
  event: string;
  info: {
    secure_url: string;
  };
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: Error | null, result: CloudinaryResult) => void
      ) => {
        open: () => void;
        close: () => void;
      };
    };
  }
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = "Upload Image",
  disabled = false,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const onUpload = () => {
    setLoading(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      alert("Cloudinary is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your .env file");
      setLoading(false);
      return;
    }

    // Load Cloudinary widget
    if (typeof window !== "undefined" && window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset: "dazzle-glam", // You'll need to create this in Cloudinary dashboard
          sources: ["local", "url", "camera"],
          multiple: false,
          folder: "dazzle-glam",
          maxFileSize: 5000000, // 5MB
          clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif"],
          resourceType: "image",
        },
        (error: Error | null, result: CloudinaryResult) => {
          if (!error && result && result.event === "success") {
            onChange(result.info.secure_url);
            setLoading(false);
            widget.close();
          }
          if (error) {
            console.error("Upload error:", error);
            setLoading(false);
          }
        }
      );

      widget.open();
    } else {
      // Fallback: load Cloudinary script if not loaded
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      script.onload = () => {
        setLoading(false);
        onUpload(); // Retry after script loads
      };
      document.body.appendChild(script);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
          {onRemove && !disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-2 top-2 rounded-full bg-black/80 p-1.5 text-white hover:bg-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onUpload}
          disabled={disabled || loading}
          className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-white/20 bg-white/5 transition hover:border-fuchsia hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-fuchsia" />
              <span className="text-sm text-white/60">Loading...</span>
            </>
          ) : (
            <>
              <div className="rounded-full bg-fuchsia/10 p-3">
                <ImageIcon className="h-8 w-8 text-fuchsia" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">
                  Click to upload image
                </p>
                <p className="mt-1 text-xs text-white/40">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {!value && !loading && (
        <p className="text-xs text-white/40">
          Images will be uploaded to Cloudinary
        </p>
      )}
    </div>
  );
}
