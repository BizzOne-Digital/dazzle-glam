"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { brand } from "@/config/site";

const tabs = [
  "General",
  "Branding",
  "Social",
  "E-Commerce",
  "Integrations",
  "SEO",
  "Maintenance",
] as const;

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("General");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-white/50">
            Global site configuration. Private secrets stay server-side via environment variables.
          </p>
        </div>
        <Button onClick={() => toast.success("Settings saved (connect MongoDB to persist)")}>
          Save settings
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-sm border px-3 py-1.5 text-xs uppercase tracking-wider ${
              tab === t ? "border-fuchsia text-fuchsia" : "border-white/15 text-silver"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 rounded-xl border border-white/10 p-6 md:grid-cols-2">
        {tab === "General" && (
          <>
            <Input label="Business name" defaultValue={brand.name} />
            <Input label="Phone" defaultValue={brand.phone} />
            <Input label="Email" defaultValue={brand.email} />
            <Input label="Address" defaultValue="Toronto, Ontario, Canada" />
            <Input label="Currency" defaultValue="CAD" />
            <Input label="Timezone" defaultValue="America/Toronto" />
            <Textarea
              label="Business hours"
              className="md:col-span-2"
              defaultValue="Mon–Fri 10am–6pm EST · Sat 11am–4pm"
            />
          </>
        )}
        {tab === "Branding" && (
          <>
            <Input label="Primary colour" defaultValue="#FF1493" />
            <Input label="Secondary colour" defaultValue="#C0C0C0" />
            <Input label="Accent colour" defaultValue="#FF69B4" />
            <Input label="Background" defaultValue="#000000" />
            <Input label="Heading font" defaultValue="Cormorant Garamond" />
            <Input label="Body font" defaultValue="Outfit" />
            <Input label="Visual intensity" type="number" defaultValue={80} />
            <Input label="Logo path" defaultValue="/brand/logo.png" />
          </>
        )}
        {tab === "Social" && (
          <>
            <Input label="Instagram" defaultValue={brand.instagramUrl} className="md:col-span-2" />
            <Input label="Facebook" placeholder="https://" />
            <Input label="TikTok" placeholder="https://" />
            <Input label="Pinterest" placeholder="https://" />
            <Input label="YouTube" placeholder="https://" />
          </>
        )}
        {tab === "E-Commerce" && (
          <>
            <Input label="Tax rate" type="number" step="0.01" defaultValue={0.13} />
            <Input label="Free shipping threshold" type="number" defaultValue={150} />
            <Input label="Low stock limit" type="number" defaultValue={5} />
            <Input label="Order prefix" defaultValue="DG" />
          </>
        )}
        {tab === "Integrations" && (
          <>
            <p className="md:col-span-2 text-sm text-white/50">
              Stripe, Cloudinary, SMTP and analytics secrets are configured via server environment
              variables — never exposed to the browser.
            </p>
            <Input label="Cloudinary cloud name (public)" placeholder="your-cloud" />
            <Input label="Stripe publishable key (public)" placeholder="pk_…" />
            <Input label="GA ID" placeholder="G-…" />
            <Input label="Meta Pixel ID" />
            <Input label="GTM ID" placeholder="GTM-…" />
          </>
        )}
        {tab === "SEO" && (
          <>
            <Input
              label="Default title"
              defaultValue="Dazzle Glam Jewelry Collection | Bold Statement Jewelry"
              className="md:col-span-2"
            />
            <Textarea
              label="Default description"
              className="md:col-span-2"
              defaultValue="Eye-popping jewelry that commands attention."
            />
            <Input label="OG image URL" className="md:col-span-2" />
          </>
        )}
        {tab === "Maintenance" && (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-fuchsia" /> Maintenance mode
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-fuchsia" /> Coming soon mode
            </label>
            <Textarea
              label="Maintenance message"
              className="md:col-span-2"
              defaultValue="We're polishing something spectacular. Check back soon."
            />
            <Input label="Store notice" className="md:col-span-2" placeholder="Banner notice…" />
          </>
        )}
      </div>
    </div>
  );
}
