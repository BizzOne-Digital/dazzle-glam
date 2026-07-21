import { connectDB } from "../lib/db/connect";
import { hashPassword } from "../lib/auth/password";
import { AdminUser } from "../models";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.error("Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD in .env");
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("ADMIN_SEED_PASSWORD must be at least 10 characters");
    process.exit(1);
  }

  await connectDB();

  const existing = await AdminUser.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const hashed = await hashPassword(password);
  await AdminUser.create({
    name: "Dazzle Glam Admin",
    email: email.toLowerCase(),
    password: hashed,
    role: "admin",
    isActive: true,
  });

  console.log("Admin created:", email);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
