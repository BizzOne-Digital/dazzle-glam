"use client";

import { Input } from "@/components/ui/Input";
import { variantMatrixKey } from "@/lib/productVariants";

export function ColorSizeVariantGrid({
  colors,
  sizes,
  stocks,
  onChange,
}: {
  colors: string[];
  sizes: string[];
  stocks: Record<string, number>;
  onChange: (stocks: Record<string, number>) => void;
}) {
  if (!colors.length || !sizes.length) {
    return (
      <p className="text-sm text-white/40">
        Select at least one color and one size to manage stock.
      </p>
    );
  }

  const setStock = (color: string, size: string, value: number) => {
    const key = variantMatrixKey(color, size);
    onChange({
      ...stocks,
      [key]: Math.max(0, value),
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-silver">
            <th className="p-2">Size / Color</th>
            {colors.map((color) => (
              <th key={color} className="p-2">
                {color}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={size} className="border-b border-white/5">
              <td className="p-2 font-medium text-white/80">{size}</td>
              {colors.map((color) => {
                const key = variantMatrixKey(color, size);
                return (
                  <td key={key} className="p-2">
                    <Input
                      type="number"
                      min={0}
                      value={stocks[key] ?? 0}
                      onChange={(e) =>
                        setStock(color, size, Number(e.target.value) || 0)
                      }
                      className="h-10"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
