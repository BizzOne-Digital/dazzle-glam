import { connectDB } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import { demoProducts, toCardProduct } from "@/lib/data/demo";
import { mapMongoProduct, toCardFromMongo, type MongoProductLike } from "./map";

function leanList(docs: unknown[]) {
  return JSON.parse(JSON.stringify(docs)) as MongoProductLike[];
}

export async function getPublishedProducts() {
  try {
    await connectDB();
    const docs = await Product.find({ status: "published" })
      .sort({ createdAt: -1 })
      .lean();
    if (!docs.length) return demoProducts;
    return leanList(docs).map(mapMongoProduct);
  } catch (error) {
    console.error("getPublishedProducts:", error);
    return demoProducts;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await connectDB();
    const doc = await Product.findOne({ slug, status: "published" }).lean();
    if (doc) return mapMongoProduct(doc as unknown as MongoProductLike);
  } catch (error) {
    console.error("getProductBySlug:", error);
  }
  return demoProducts.find((p) => p.slug === slug) || null;
}

export async function getProductCards() {
  try {
    await connectDB();
    const docs = await Product.find({ status: "published" })
      .sort({ createdAt: -1 })
      .lean();
    if (!docs.length) return demoProducts.map(toCardProduct);
    return leanList(docs).map(toCardFromMongo);
  } catch {
    return demoProducts.map(toCardProduct);
  }
}

export async function getAdminProducts() {
  await connectDB();
  const docs = await Product.find({}).sort({ updatedAt: -1 }).lean();
  return leanList(docs).map(mapMongoProduct);
}

export async function getAdminProductById(id: string) {
  await connectDB();
  const doc = await Product.findById(id).lean();
  if (!doc) return null;
  return mapMongoProduct(doc as unknown as MongoProductLike);
}
