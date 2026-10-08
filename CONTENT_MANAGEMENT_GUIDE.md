# Content Management System Guide

## Overview
The Dazzle Glam website now has a comprehensive Content Management System (CMS) that allows you to manage ALL website content from the admin panel. Any changes you make in the admin panel will be instantly reflected on the frontend after a page refresh.

## Features
✅ **Centralized Content Management** - All page content stored in MongoDB database  
✅ **Admin Panel Interface** - Easy-to-use interface to edit any page content  
✅ **Real-time Updates** - Changes appear on frontend immediately after page refresh  
✅ **SEO Control** - Manage meta titles, descriptions, and keywords for each page  
✅ **Flexible Structure** - Supports text, images, lists, and complex content structures  
✅ **Publish/Draft System** - Control which content is visible to users  

## Setup Instructions

### 1. Seed Initial Content
Before using the CMS, you need to initialize the database with default content:

```bash
npm run seed:content
```

This will populate all pages with their default content.

### 2. Access the Admin Panel
1. Go to your website at `http://localhost:3000/admin/login`
2. Log in with your admin credentials
3. Navigate to **Content** in the sidebar menu

## Pages You Can Manage

The CMS allows you to edit content for the following pages:

### 1. **Home Page** (`home`)
- Hero Section (title, subtitle, description, background image)
- New Arrivals Section (title, description)
- Best Sellers Section (title, description)

### 2. **About Page** (`about`)
- Hero Section
- Our Story Section
- Mission Section

### 3. **Contact Page** (`contact`)
- Hero Section
- Studio Hours (weekday hours, weekend hours)

### 4. **FAQ Page** (`faq`)
- Hero Section
- FAQ Items (questions and answers - can add/remove items)

### 5. **Shipping Page** (`shipping`)
- Hero Section
- Shipping Options (multiple options - can add/remove)
- Additional Content

### 6. **Returns Page** (`returns`)
- Hero Section
- Return Policy Section
- Return Process Steps (can add/remove steps)

### 7. **Privacy Policy** (`privacy`)
- Hero Section
- Last Updated Date
- Policy Content

### 8. **Terms of Service** (`terms`)
- Hero Section
- Last Updated Date
- Terms Content

### 9. **Accessibility** (`accessibility`)
- Hero Section
- Accessibility Statement Content

### 10. **Gallery** (`gallery`)
- Hero Section

### 11. **Shop** (`shop`)
- Hero Section

## How to Edit Content

### Step 1: Select a Page
1. In the admin Content Management page, you'll see a list of all pages on the left sidebar
2. Click on any page name (e.g., "home", "about", "contact")

### Step 2: Edit Content Sections
Each page is divided into **sections** (e.g., "hero", "story", "items"):

- **Simple Fields**: Edit text in the input boxes
- **Long Text**: Use the textarea for longer content
- **Arrays/Lists**: Use the "Add Item" and "Remove" buttons to manage lists

### Step 3: Update SEO Settings
At the top of the editor, you can set:
- **Meta Title**: The title that appears in browser tabs and search results
- **Meta Description**: The description shown in search results

### Step 4: Save Changes
1. Click the **"Save Changes"** button at the top right
2. Wait for the success message
3. Refresh the frontend page to see your changes

## Content Structure Examples

### Simple Section (e.g., Hero)
```json
{
  "hero": {
    "title": "Get in Touch",
    "subtitle": "We'd love to hear from you",
    "description": "Whether you have a question...",
    "image": "/products/product-1.png"
  }
}
```

### Array Section (e.g., FAQ Items)
```json
{
  "items": [
    {
      "question": "What materials are used?",
      "answer": "Our jewelry is crafted from..."
    },
    {
      "question": "How do I determine my ring size?",
      "answer": "We offer sizes 5-12..."
    }
  ]
}
```

## Tips & Best Practices

### ✅ DO:
- **Keep titles concise** - Aim for 5-10 words max
- **Write clear descriptions** - Help users understand what they'll find
- **Use consistent tone** - Match the brand voice (bold, confident, glamorous)
- **Test your changes** - Always view the frontend after saving
- **Save frequently** - Don't lose your work!

### ❌ DON'T:
- **Use HTML tags** - The system handles formatting automatically
- **Leave fields empty** - Fill all fields to avoid display issues
- **Forget to save** - Always click "Save Changes" before leaving
- **Remove required sections** - Keep core sections intact

## Image Management

### Updating Images
To change images referenced in content:
1. Upload the new image to the **Media** section first
2. Copy the image URL
3. Paste it in the content field (e.g., `hero.image`)

### Recommended Image Sizes
- **Hero Images**: 1920x1080px or larger
- **Product Images**: 1000x1000px
- **Gallery Images**: 800x800px minimum

## Technical Details

### Database Structure
```typescript
{
  pageKey: string,          // e.g., "home", "about"
  sections: {               // Flexible content structure
    hero: { ... },
    story: { ... },
    items: [ ... ]
  },
  seo: {
    title: string,
    description: string,
    keywords: string[]
  },
  isPublished: boolean
}
```

### API Endpoints
- **GET** `/api/content/[pageKey]` - Fetch content for a specific page
- **Server Action** `updatePageContent()` - Update page content from admin

### Files Involved
- `models/PageContent.ts` - Database model
- `actions/pageContent.ts` - Server actions for content management
- `app/admin/content/page.tsx` - Admin interface
- `app/api/content/[pageKey]/route.ts` - API route
- `hooks/usePageContent.ts` - Client-side hook for fetching content

## Troubleshooting

### Changes Not Appearing?
1. **Hard refresh** your browser (Ctrl + Shift + R)
2. **Clear cache** if still not working
3. **Check the console** for any errors
4. **Verify you saved** the changes in admin

### Content Not Loading?
1. **Check MongoDB connection** - Make sure your database is running
2. **Run seed command** if database is empty: `npm run seed:content`
3. **Check .env file** - Ensure `MONGODB_URI` is set correctly

### Can't Edit Certain Fields?
- Some fields might be **read-only** or controlled elsewhere
- Check if the field is managed through **Site Settings** instead

## Advanced Usage

### Adding New Sections
If you need a new content section:
1. Edit the page template in `app/admin/content/page.tsx`
2. Add the section to the `PAGE_TEMPLATES` object
3. Update the frontend page component to use the new section

### Programmatic Content Updates
You can also update content programmatically:

```typescript
import { updatePageContent } from '@/actions/pageContent';

await updatePageContent('home', {
  sections: {
    hero: {
      title: 'New Title',
      description: 'New description'
    }
  }
});
```

## Support

If you encounter any issues:
1. Check this guide first
2. Review the browser console for errors
3. Verify database connection
4. Contact your developer if problems persist

---

**Happy content managing! 💎✨**
