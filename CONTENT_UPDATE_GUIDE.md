# Content Update Guide - Important!

## ✅ Settings Updated Successfully

Your contact information has been updated to match the current site:
- **Phone**: (416) 905-7500
- **Email**: dazzleglamcollection@gmail.com
- **Instagram**: https://www.instagram.com/dazzleglamcollection
- **Facebook**: https://www.facebook.com/dazzleglamcollection

---

## How Content Updates Work

### Where Content is Stored
All your website content is stored in **MongoDB database**:
- Site Settings (phone, email, social links, shipping rates)
- Page Content (all text on every page)

### Where You Edit Content
**Admin Panel**: `http://localhost:3000/admin`

1. **Settings** (`/admin/settings`) - Contact info, business hours, social media
2. **Content** (`/admin/content`) - All page text and descriptions

---

## How to See Your Updates on Frontend

### Method 1: Hard Refresh (RECOMMENDED)
After saving in admin panel:
1. Go to the frontend page (e.g., `/contact`)
2. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
3. This forces the browser to fetch fresh data

### Method 2: Clear Browser Cache
1. Open browser settings
2. Clear browsing data
3. Check "Cached images and files"
4. Click "Clear data"

### Method 3: Incognito/Private Window
1. Open an incognito/private browsing window
2. Visit your site
3. You'll see the latest content without cache

---

## Why Content Doesn't Update Immediately

### Browser Caching
- Browsers cache (save) website data to load pages faster
- Even though data is updated in database, browser shows old cached version
- Hard refresh forces browser to get new data

### What We Fixed
✅ Disabled server-side caching on API routes  
✅ Added cache-control headers to prevent caching  
✅ Added proper revalidation after content updates  
✅ Updated all default values to match current site  

---

## Step-by-Step: Update Contact Info

### 1. Go to Admin Settings
```
http://localhost:3000/admin/settings
```

### 2. Edit the Information
**General Tab:**
- Business Name
- Phone: `(416) 905-7500` ✓ (already updated)
- Email: `dazzleglamcollection@gmail.com` ✓ (already updated)
- Address
- Business Hours

**Social Tab:**
- Instagram URL ✓ (already updated)
- Facebook URL ✓ (already updated)
- TikTok, Pinterest, YouTube (optional)

**E-Commerce Tab:**
- Tax Rate: 13%
- Free Shipping Threshold: $100
- Standard Shipping: $8
- Express Shipping: $15
- Discount settings

### 3. Save Changes
Click **"SAVE SETTINGS"** button at top right

### 4. View on Frontend
1. Go to Contact page: `http://localhost:3000/contact`
2. **Hard Refresh**: Press **Ctrl + Shift + R**
3. You'll see updated phone number and info!

---

## Step-by-Step: Update Page Content

### 1. Go to Admin Content
```
http://localhost:3000/admin/content
```

### 2. Select a Page
Click any page from left sidebar:
- home
- about
- contact
- faq
- shipping
- returns
- privacy
- terms
- accessibility
- gallery
- shop

### 3. Edit Content Sections
Each page has sections like:
- **hero** - Main banner text
- **items** - Lists (FAQ questions, shipping options)
- **content** - Body text

Edit the text in input fields

### 4. Update SEO (Optional)
- Meta Title
- Meta Description

### 5. Save Changes
Click **"Save Changes"** button

### 6. View on Frontend
1. Go to the page you edited
2. **Hard Refresh**: **Ctrl + Shift + R**
3. See your updates!

---

## Current Contact Information

### As Shown on Website:
```
CALL US
(416) 905-7500

EMAIL
dazzleglamcollection@gmail.com

INSTAGRAM
@dazzleglamcollection

FACEBOOK
@dazzleglamcollection

STUDIO HOURS
Mon–Fri 9am–9pm · Sat–Sun 9am–6pm
```

### Where It's Stored:
- **Database**: MongoDB `dazzle-glam` collection `sitesettings`
- **Editable**: Admin Settings page
- **Displays**: Contact page, Footer, anywhere contact info appears

---

## Troubleshooting

### "I saved but don't see changes"
**Solution**: Hard refresh (Ctrl + Shift + R)

### "Hard refresh doesn't work"
**Solution**: Try incognito window or clear all browser cache

### "Changes disappeared"
**Solution**: Check if you clicked "Save Changes" button. If yes, data is in database. Just hard refresh to see it.

### "Some pages update, others don't"
**Solution**: Each page needs its own hard refresh. Or clear entire browser cache once.

---

## Technical Details (For Developers)

### Cache Strategy
- API routes: `no-store, no-cache`
- Revalidation: Automatic on save
- Dynamic routes: `force-dynamic`

### Data Flow
```
Admin Edit → MongoDB → API Route → Frontend Fetch → Display
```

### Revalidation Triggers
- Save in Admin Settings → Revalidates all pages
- Save in Admin Content → Revalidates specific page
- Hard refresh → Bypasses all caches

---

## Commands Reference

```bash
# Update settings to current values
npm run update:settings

# Seed page content
npm run seed:content

# Start dev server
npm run dev
```

---

## Best Practices

### ✅ DO:
- Always click "Save Changes" button
- Hard refresh after saving
- Test updates in incognito window
- Keep content consistent across pages

### ❌ DON'T:
- Expect instant updates without refresh
- Forget to save before leaving admin
- Edit database directly (use admin panel)
- Leave fields empty

---

## Quick Reference Card

| Task | Steps |
|------|-------|
| **Update Phone** | Admin → Settings → General → Phone → Save → Hard Refresh |
| **Update Hours** | Admin → Settings → General → Business Hours → Save → Hard Refresh |
| **Update Social** | Admin → Settings → Social → URLs → Save → Hard Refresh |
| **Update Page Text** | Admin → Content → Select Page → Edit → Save → Hard Refresh |
| **See Changes** | Go to page → Press Ctrl + Shift + R |

---

**Remember: Hard Refresh (Ctrl + Shift + R) is your best friend! 🔄**

Contact info is now correct on both admin panel and frontend! ✅
