# Feedback System - Setup Guide

## Overview

Simple feedback system with two parts:
1. **Users submit** → Via Google Form (you manage)
2. **Users view** → Community reviews from GitHub Issues

---

## Setup Steps

### 1. Create Google Form

1. Go to: https://forms.google.com
2. Create a new form with fields:
   - Name (short answer)
   - Rating (1-5 scale or multiple choice)
   - Feedback message (paragraph)
3. Click **Send** → Get link
4. Copy the shortened link (e.g., `https://forms.gle/abc123`)

### 2. Update Google Form URL

Open `src/components/FeedbackDialog.tsx` and replace:

```typescript
const GOOGLE_FORM_URL = "https://forms.gle/YOUR_FORM_ID";
```

With your actual Google Form link.

### 3. Configure GitHub (for displaying reviews)

Open `src/lib/github-feedback.ts` and update:

```typescript
const GITHUB_CONFIG = {
  owner: 'YOUR_GITHUB_USERNAME',  // e.g., 'rpelectrical06'
  repo: 'YOUR_REPO_NAME',         // e.g., 'printing-price-pro'
};
```

---

## How It Works

### For Users
1. Click **Feedback** button
2. **Share Feedback** tab → Opens Google Form in new tab
3. **Community Reviews** tab → See approved feedback

### For You (Admin)
1. Receive Google Form submissions
2. Review feedback
3. Manually create GitHub Issue for approved feedback
4. Users see it in "Community Reviews"

---

## Adding Feedback to GitHub

When you receive good feedback via Google Form:

1. Go to your GitHub repo → **Issues** tab
2. Click **New Issue**
3. Title: `Feedback: 5⭐ from John Doe`
4. Body:
```markdown
## User Feedback

**Name:** John Doe
**Rating:** ⭐⭐⭐⭐⭐ (5/5)
**Date:** 2026-01-08

**Encrypted Message:**
\`\`\`
[Use encryption.ts to encrypt the message]
\`\`\`
```
5. Add labels: `feedback`, `rating-5`
6. Click **Submit new issue**

---

## Encrypting Messages

To encrypt feedback before adding to GitHub:

```typescript
// In browser console or Node.js
import { encryptMessage } from './src/lib/encryption';
const encrypted = encryptMessage("Great tool, very helpful!");
console.log(encrypted); // Copy this to GitHub issue
```

---

## Benefits

✅ **No Configuration Needed** - Works immediately  
✅ **You Control Content** - Only approved feedback shows  
✅ **Simple for Users** - Just click a button  
✅ **Easy Management** - Use familiar Google Forms  
✅ **Privacy** - Messages encrypted in GitHub  

---

## Troubleshooting

**Google Form doesn't open**
- Update `GOOGLE_FORM_URL` in `FeedbackDialog.tsx`

**No reviews showing**
- Update `GITHUB_CONFIG` in `github-feedback.ts`
- Make sure issues have `feedback` label
- Click Refresh button in app
