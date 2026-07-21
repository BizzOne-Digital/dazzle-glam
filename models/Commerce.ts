import mongoose, { Schema, models, model } from "mongoose";
import type {
  Address,
  DiscountType,
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
} from "@/types";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  variantLabel?: string;
}

export interface ICart {
  _id: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  discountCode?: string;
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    name: String,
    image: String,
    variantLabel: String,
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
    sessionId: { type: String, index: true },
    items: [CartItemSchema],
    discountCode: String,
  },
  { timestamps: true }
);

export const Cart = models.Cart || model<ICart>("Cart", CartSchema);

export interface IWishlist {
  _id: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  sessionId?: string;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
    sessionId: { type: String, index: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export const Wishlist =
  models.Wishlist || model<IWishlist>("Wishlist", WishlistSchema);

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variantId?: string;
  name: string;
  sku?: string;
  image?: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customer?: mongoose.Types.ObjectId;
  email: string;
  phone?: string;
  items: IOrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingMethod?: string;
  trackingNumber?: string;
  courier?: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  notes?: string;
  internalNotes?: string;
  cancelledAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: String,
    name: { type: String, required: true },
    sku: String,
    image: String,
    variantLabel: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    company: String,
    line1: String,
    line2: String,
    city: String,
    province: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
    email: { type: String, required: true, index: true },
    phone: String,
    items: [OrderItemSchema],
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    discountCode: String,
    shippingAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "CAD" },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    fulfillmentStatus: {
      type: String,
      enum: ["unfulfilled", "partial", "fulfilled", "returned"],
      default: "unfulfilled",
    },
    shippingMethod: String,
    trackingNumber: String,
    courier: String,
    stripePaymentIntentId: String,
    stripeSessionId: String,
    notes: String,
    internalNotes: String,
    cancelledAt: Date,
    refundedAt: Date,
  },
  { timestamps: true }
);

export const Order = models.Order || model<IOrder>("Order", OrderSchema);

export interface IDiscount {
  _id: mongoose.Types.ObjectId;
  code?: string;
  name: string;
  type: DiscountType;
  value: number;
  minPurchase?: number;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  productIds: mongoose.Types.ObjectId[];
  collectionIds: mongoose.Types.ObjectId[];
  startsAt?: Date;
  endsAt?: Date;
  isAutomatic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: { type: String, uppercase: true, sparse: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      required: true,
    },
    value: { type: Number, required: true },
    minPurchase: Number,
    usageLimit: Number,
    usageCount: { type: Number, default: 0 },
    perCustomerLimit: Number,
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    collectionIds: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    startsAt: Date,
    endsAt: Date,
    isAutomatic: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Discount =
  models.Discount || model<IDiscount>("Discount", DiscountSchema);
