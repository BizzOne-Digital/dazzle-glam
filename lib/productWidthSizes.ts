import { RING_WIDTH_PRESETS } from "@/lib/productSizes";

const ALLOWED_WIDTHS = new Set<string>(RING_WIDTH_PRESETS);

export function parseWidthSizesMap(raw: unknown): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!raw) return out;

  const apply = (key: string, value: unknown) => {
    if (!ALLOWED_WIDTHS.has(key)) return;
    const list = Array.isArray(value)
      ? value.map(String).filter(Boolean)
      : [];
    out[key] = list;
  };

  if (raw instanceof Map) {
    for (const [k, v] of raw.entries()) apply(String(k), v);
    return out;
  }

  if (typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      apply(k, v);
    }
  }

  return out;
}

export function parseWidthSizeStockMap(
  raw: unknown,
  widths: readonly string[],
  sizeKeys: readonly string[]
): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const width of widths) {
    out[width] = Object.fromEntries(sizeKeys.map((s) => [s, 0]));
  }
  if (!raw) return out;

  const applyWidth = (widthKey: string, stockRaw: unknown) => {
    if (!ALLOWED_WIDTHS.has(widthKey)) return;
    const row: Record<string, number> = Object.fromEntries(
      sizeKeys.map((s) => [s, 0])
    );

    if (stockRaw instanceof Map) {
      for (const [k, v] of stockRaw.entries()) {
        const size = String(k);
        if (sizeKeys.includes(size)) {
          row[size] = Math.max(0, Number(v) || 0);
        }
      }
    } else if (typeof stockRaw === "object" && stockRaw) {
      for (const [k, v] of Object.entries(stockRaw as Record<string, unknown>)) {
        if (sizeKeys.includes(k)) {
          row[k] = Math.max(0, Number(v) || 0);
        }
      }
    }

    out[widthKey] = row;
  };

  if (raw instanceof Map) {
    for (const [k, v] of raw.entries()) applyWidth(String(k), v);
    return out;
  }

  if (typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      applyWidth(k, v);
    }
  }

  return out;
}

export function cleanWidthSizesMap(
  input: Record<string, string[]>,
  allowedSizes: readonly string[]
): Record<string, string[]> {
  const allowed = new Set(allowedSizes);
  const out: Record<string, string[]> = {};
  for (const width of RING_WIDTH_PRESETS) {
    const list = (input[width] || []).filter((s) => allowed.has(s));
    if (list.length) out[width] = list;
  }
  return out;
}
