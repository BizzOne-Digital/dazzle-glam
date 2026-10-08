# Dazzle Glam Jewelry Collection

Luxury e-commerce storefront and admin portal for **Dazzle Glam Jewelry Collection** (client: Karleen).

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, MongoDB/Mongoose, NextAuth, Framer Motion, Stripe-ready checkout, and Cloudinary-ready media uploads.

## Features

- Cinematic storefront (intro, hero, collections, products, gallery, services, checkout)
- Full shopping bag, wishlist, account auth, and legal pages
- Secure `/admin` portal for products, orders, customers, content, media, SEO, and settings
- Demo catalog with all 18 ring SKUs from your product sheet plus statement earrings/necklaces/bracelets
- Seed scripts for admin + catalog data

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The storefront works immediately with built-in demo product data. Connect MongoDB to enable persistence, admin seeding, contact inbox, and newsletter storage.

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Auth.js session secret |
| `NEXTAUTH_URL` | `http://localhost:3000` in development |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | First admin account |
| `CLOUDINARY_*` | Image uploads |
| `STRIPE_*` | Live checkout + webhooks |

Never commit real credentials.

## Create the first admin

1. Set `MONGODB_URI`, `ADMIN_SEED_EMAIL`, and `ADMIN_SEED_PASSWORD` in `.env`
2. Run:

```bash
npm run seed:admin
```

3. Sign in at `/admin/login`

## Seed catalog data

```bash
npm run seed
```

This loads products (including your ring catalogue), collections, testimonials, services, gallery items, shipping methods, and homepage content.

## MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add a database user and allow your IP (or `0.0.0.0/0` for Vercel)
3. Paste the connection string into `MONGODB_URI`

## Cloudinary

1. Create a Cloudinary account
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Optionally set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` for client widgets
4. Upload product images from **Admin → Media** (replace Unsplash placeholders)

## Stripe

1. Create a Stripe account and copy test keys
2. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
3. Point webhook endpoint to `/api/stripe/webhook`
4. Card data is never stored in MongoDB — Stripe handles PCI scope

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run seed` | Seed catalog |
| `npm run seed:admin` | Create admin user |
| `npm run lint` | ESLint |

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your production domain
6. Re-run seed scripts against production MongoDB if needed

## Project structure

```
app/(storefront)/   Customer-facing pages
app/admin/          Admin portal
app/api/            Auth + Stripe webhooks
components/         UI, layout, home, products, admin
lib/                Auth, DB, validations, services, demo data
models/             Mongoose schemas
actions/            Server actions
scripts/            Seed scripts
public/brand/       Logo + favicon
```

## Brand assets

- Logo: `public/brand/logo.png` (your uploaded Dazzle Glam logo)
- Favicon: `public/brand/favicon.svg`
- Product images: replace Unsplash placeholders via Admin → Media / product edit

## Business info

- **Phone:** (416) 305-7500
- **Email:** dazzleglamcollection@gmail.com
- **Instagram:** [@dazzleglamcollection](https://instagram.com/dazzleglamcollection)
- **Site:** https://dazzleglamjewelry.ca

## License

Private project for Karleen / Dazzle Glam Jewelry Collection.
