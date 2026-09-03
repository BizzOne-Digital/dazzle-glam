"use client";

import { useState, useEffect } from "react";

export interface PageContentData {
  pageKey: string;
  sections: Record<string, unknown>;
  seo: {
    title: string;
    description: string;
    keywords?: string[];
  };
  isPublished: boolean;
}

export function usePageContent(pageKey: string) {
  const [content, setContent] = useState<PageContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/content/${pageKey}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch content");
        }

        const data = await response.json();
        setContent(data);
        setError(null);
      } catch (err: unknown) {
        console.error(`Error fetching content for ${pageKey}:`, err);
        setError(err instanceof Error ? err.message : "Failed to fetch content");
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [pageKey]);

  return { content, loading, error };
}
