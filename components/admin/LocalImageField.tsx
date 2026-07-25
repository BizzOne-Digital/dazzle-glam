"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Folder = "gallery" | "products" | "pages" | "misc";

export function LocalImageField({
  label,
  value,
  onChange,
  folder = "misc",
  className,
}: {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: Folder;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm text-white/70">{label}</p>}
      <div className="flex flex-wrap items-start gap-3">
        {value ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-white/10">
            <Image src={value} alt="" fill className="object-cover" sizes="96px" />
            <button
              type="button"
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
              onClick={() => onChange("")}
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-white/20 text-white/30">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </Button>
          {value && (
            <p className="max-w-[220px] truncate text-[11px] text-white/40">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}
