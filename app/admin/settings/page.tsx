"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { getSiteSettings, updateSiteSettings, type SiteSettingsData } from "@/actions/settings";

const tabs = [
  "General",
  "Social",
  "E-Commerce",
  "SEO",
] as const;

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettingsData>({
    businessName: "",
    phone: "",
    email: "",
    address: "",
    businessHours: "",
    currency: "CAD",
    timezone: "America/Toronto",
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    pinterestUrl: "",
    youtubeUrl: "",
    taxRate: 0.13,
    freeShippingThreshold: 50,
    standardShippingCost: 8,
    expressShippingCost: 15,
    discountThreshold: 65,
    discountPercentage: 10,
    defaultTitle: "",
    defaultDescription: "",
    ogImageUrl: "",
    storeNotice: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    console.log("=== LOADING SETTINGS ===");
    
    try {
      const result = await getSiteSettings();
      console.log("Load result:", result);
      
      if (result.success && result.data) {
        console.log("Settings loaded:", result.data);
        setSettings(result.data);
      } else {
        console.error("Failed to load settings:", result);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      console.log("=== SAVING SETTINGS ===");
      console.log("Data being sent:", settings);
      
      const result = await updateSiteSettings(settings);
      
      console.log("=== SAVE RESULT ===");
      console.log("Success:", result.success);
      console.log("Message:", result.message);
      console.log("Full result:", result);
      
      if (result.success) {
        toast.success("Settings saved successfully! ✅");
        // Reload settings to verify
        await loadSettings();
        console.log("Settings reloaded after save");
      } else {
        toast.error(result.message || "Failed to save settings");
        console.error("Save failed:", result);
        
        // Show validation errors if any
        if (result.errors) {
          console.error("Validation errors:", result.errors);
          Object.entries(result.errors).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach(err => toast.error(`${field}: ${err}`));
            }
          });
        }
      }
    } catch (error) {
      console.error("=== SAVE ERROR ===");
      console.error("Error details:", error);
      toast.error("Network error! Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SiteSettingsData, value: string | number) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-fuchsia" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage your site settings. Changes will be reflected across the website.
          </p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          Save settings
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-sm border px-3 py-1.5 text-xs uppercase tracking-wider transition ${
              tab === t ? "border-fuchsia bg-fuchsia/10 text-fuchsia" : "border-white/15 text-silver hover:border-white/30"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
        {tab === "General" && (
          <>
            <Input 
              label="Business name" 
              value={settings.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
            />
            <Input 
              label="Phone" 
              value={settings.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
            <Input 
              label="Email" 
              type="email"
              value={settings.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <Input 
              label="Address" 
              value={settings.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
            <Input 
              label="Currency" 
              value={settings.currency}
              onChange={(e) => updateField("currency", e.target.value)}
            />
            <Input 
              label="Timezone" 
              value={settings.timezone}
              onChange={(e) => updateField("timezone", e.target.value)}
            />
            <Textarea
              label="Business hours"
              className="md:col-span-2"
              rows={3}
              value={settings.businessHours}
              onChange={(e) => updateField("businessHours", e.target.value)}
              placeholder="e.g., Mon–Fri 9am–9pm · Sat–Sun 9am–6pm"
            />
          </>
        )}
        
        {tab === "Social" && (
          <>
            <Input 
              label="Instagram URL" 
              className="md:col-span-2"
              value={settings.instagramUrl}
              onChange={(e) => updateField("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/yourusername"
            />
            <Input 
              label="Facebook URL" 
              className="md:col-span-2"
              value={settings.facebookUrl}
              onChange={(e) => updateField("facebookUrl", e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
            <Input 
              label="TikTok URL" 
              value={settings.tiktokUrl}
              onChange={(e) => updateField("tiktokUrl", e.target.value)}
              placeholder="https://tiktok.com/@yourusername"
            />
            <Input 
              label="Pinterest URL" 
              value={settings.pinterestUrl}
              onChange={(e) => updateField("pinterestUrl", e.target.value)}
              placeholder="https://pinterest.com/yourusername"
            />
            <Input 
              label="YouTube URL" 
              className="md:col-span-2"
              value={settings.youtubeUrl}
              onChange={(e) => updateField("youtubeUrl", e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
            />
          </>
        )}
        
        {tab === "E-Commerce" && (
          <>
            <Input 
              label="Tax rate (%)" 
              type="number"
              step="0.01"
              value={settings.taxRate * 100}
              onChange={(e) => updateField("taxRate", parseFloat(e.target.value || "0") / 100)}
            />
            <Input 
              label="Free shipping threshold ($)" 
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) => updateField("freeShippingThreshold", parseFloat(e.target.value || "0"))}
            />
            <Input 
              label="Standard shipping cost ($)" 
              type="number"
              value={settings.standardShippingCost}
              onChange={(e) => updateField("standardShippingCost", parseFloat(e.target.value || "0"))}
            />
            <Input 
              label="Express shipping cost ($)" 
              type="number"
              value={settings.expressShippingCost}
              onChange={(e) => updateField("expressShippingCost", parseFloat(e.target.value || "0"))}
            />
            <Input 
              label="Discount threshold ($)" 
              type="number"
              value={settings.discountThreshold}
              onChange={(e) => updateField("discountThreshold", parseFloat(e.target.value || "0"))}
              hint="Apply discount when cart total reaches this amount"
            />
            <Input 
              label="Discount percentage (%)" 
              type="number"
              value={settings.discountPercentage}
              onChange={(e) => updateField("discountPercentage", parseFloat(e.target.value || "0"))}
            />
          </>
        )}
        
        {tab === "SEO" && (
          <>
            <Input
              label="Default page title"
              className="md:col-span-2"
              value={settings.defaultTitle}
              onChange={(e) => updateField("defaultTitle", e.target.value)}
              placeholder="Dazzle Glam Jewelry Collection | Bold Statement Jewelry"
            />
            <Textarea
              label="Default meta description"
              className="md:col-span-2"
              rows={3}
              value={settings.defaultDescription}
              onChange={(e) => updateField("defaultDescription", e.target.value)}
              placeholder="Eye-popping jewelry that commands attention..."
            />
            <Input 
              label="OG image URL" 
              className="md:col-span-2"
              value={settings.ogImageUrl}
              onChange={(e) => updateField("ogImageUrl", e.target.value)}
              placeholder="https://yourdomain.com/og-image.jpg"
            />
            <Textarea
              label="Store notice (optional)"
              className="md:col-span-2"
              rows={2}
              value={settings.storeNotice}
              onChange={(e) => updateField("storeNotice", e.target.value)}
              placeholder="Announcement banner text..."
              hint="Leave empty to hide the store notice"
            />
          </>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">
          Save all changes
        </Button>
      </div>
    </div>
  );
}
