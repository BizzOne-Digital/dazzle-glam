export type AdminOrderLineInput = {
  productId?: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
  variantLabel?: string;
  sku?: string;
  image?: string;
};
