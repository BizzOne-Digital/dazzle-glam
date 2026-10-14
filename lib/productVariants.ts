export const PET_COLLAR_COLORS = ["Pink", "Red", "Black"] as const;
export const PET_COLLAR_SIZES = ["Extra Small", "Small", "Medium"] as const;

export type ColorSizeVariantInput = {
  color: string;
  size: string;
  stock: number;
  sku?: string;
};

export type ProductVariantPlain = {
  id?: string;
  name: string;
  color?: string;
  size?: string;
  stock: number;
  sku?: string;
  image?: string;
};

export function categoryUsesColorSizeMatrix(category?: string | null): boolean {
  return category === "for-pets";
}

export function variantMatrixKey(color: string, size: string): string {
  return `${color}::${size}`;
}

export function getPetCollarDefaults() {
  return {
    colors: [...PET_COLLAR_COLORS],
    sizes: [...PET_COLLAR_SIZES],
  };
}

export function buildVariantsFromMatrix(
  colors: string[],
  sizes: string[],
  stocks: Record<string, number>
): ProductVariantPlain[] {
  const variants: ProductVariantPlain[] = [];

  for (const color of colors) {
    for (const size of sizes) {
      const key = variantMatrixKey(color, size);
      variants.push({
        name: `${color} / ${size}`,
        color,
        size,
        stock: Math.max(0, Number(stocks[key] ?? 0)),
      });
    }
  }

  return variants;
}

export function matrixFromVariants(
  variants: Array<{ color?: string; size?: string; stock?: number }>
): Record<string, number> {
  const stocks: Record<string, number> = {};
  for (const variant of variants) {
    if (!variant.color || !variant.size) continue;
    stocks[variantMatrixKey(variant.color, variant.size)] = Math.max(
      0,
      Number(variant.stock ?? 0)
    );
  }
  return stocks;
}

export function totalVariantStock(
  variants: Array<{ stock?: number }> | undefined
): number {
  return (variants || []).reduce(
    (sum, variant) => sum + Math.max(0, Number(variant.stock ?? 0)),
    0
  );
}

export function findVariantStock(
  variants: ProductVariantPlain[] | undefined,
  color?: string | null,
  size?: string | null
): number {
  if (!color || !size) return 0;
  const match = (variants || []).find(
    (variant) => variant.color === color && variant.size === size
  );
  return Math.max(0, Number(match?.stock ?? 0));
}

export function createEmptyVariantMatrix(
  colors: readonly string[] | string[],
  sizes: readonly string[] | string[]
): Record<string, number> {
  const stocks: Record<string, number> = {};
  for (const color of colors) {
    for (const size of sizes) {
      stocks[variantMatrixKey(color, size)] = 0;
    }
  }
  return stocks;
}

export function buildVariantMatrixPayload(
  colors: string[],
  sizes: string[],
  stocks: Record<string, number>
): ColorSizeVariantInput[] {
  return colors.flatMap((color) =>
    sizes.map((size) => ({
      color,
      size,
      stock: Math.max(0, Number(stocks[variantMatrixKey(color, size)] ?? 0)),
    }))
  );
}
