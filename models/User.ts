import mongoose, { Schema, models, model } from "mongoose";
import type { Address, UserRole } from "@/types";

export interface IAdminUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"], default: "admin" },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    resetToken: String,
    resetTokenExpiry: Date,
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AdminUser =
  models.AdminUser || model<IAdminUser>("AdminUser", AdminUserSchema);

export interface ICustomer {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "customer";
  addresses: Address[];
  wishlist: mongoose.Types.ObjectId[];
  recentlyViewed: mongoose.Types.ObjectId[];
  notes?: string;
  totalSpent: number;
  orderCount: number;
  isDisabled: boolean;
  emailVerified?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    company: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "CA" },
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: String,
    phone: String,
    role: { type: String, default: "customer" },
    addresses: [AddressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    recentlyViewed: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    notes: String,
    totalSpent: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    isDisabled: { type: Boolean, default: false },
    emailVerified: Date,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

export const Customer =
  models.Customer || model<ICustomer>("Customer", CustomerSchema);
