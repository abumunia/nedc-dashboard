# NEDC Network Performance Dashboard — Netlify Deployment

## Quick Deploy (5 minutes)

### Step 1 — Upload to Netlify
1. Go to https://netlify.com and sign in / create free account
2. Click **"Add new site"** → **"Import an existing project"**
   - OR drag the entire project **folder** onto the Netlify deploy zone

### Step 2 — Set Admin Password (Environment Variable)
1. In Netlify dashboard → **Site configuration** → **Environment variables**
2. Click **"Add a variable"**
3. Key: `ADMIN_PASSWORD`
4. Value: choose a strong password (e.g. `NEDC@2026!`)
5. Click **Save**
6. Go to **Deploys** → **Trigger deploy** → **Deploy site**

### Step 3 — Enable Netlify Blobs
Netlify Blobs is automatically enabled when you use `@netlify/blobs` in your functions.
No extra setup needed — it works out of the box.

---

## How It Works

```
Visitor opens site
    ↓
Browser calls /api/load-data (Netlify Function)
    ↓
Netlify Blobs returns latest JSON data
    ↓
Dashboard renders with live data
```

```
Admin uploads Excel file
    ↓
Browser parses Excel → JSON
    ↓
Password prompt
    ↓
Browser calls /api/save-data with JSON + password
    ↓
Netlify Function validates password → saves to Netlify Blobs
    ↓
All visitors now see new data (within 30 seconds)
```

---

## File Structure
```
/
├── netlify.toml              ← Netlify configuration
├── package.json              ← Dependencies (@netlify/blobs)
├── public/
│   └── index.html            ← The full dashboard (single file)
└── netlify/
    └── functions/
        ├── save-data.js      ← POST /api/save-data (admin only)
        └── load-data.js      ← GET /api/load-data (all visitors)
```

---

## Monthly Update Workflow

1. Prepare the new monthly Excel file
2. Open the dashboard URL
3. Click **"🔒 Admin · Update Data"** (bottom of welcome screen or topbar)
4. Drop the new Excel file
5. Enter admin password when prompted
6. All visitors automatically see the new data within 30 seconds ✅

---

## Troubleshooting

**Icons not showing?**
→ All icons are inline SVG — no CDN needed. Should always work.

**Data not loading for visitors?**
→ Check Netlify Functions logs in dashboard → Functions tab
→ Make sure `ADMIN_PASSWORD` env variable is set and site was redeployed

**"Could not publish" error after upload?**
→ Data still loaded locally in your browser. Check your internet connection.
→ Verify the password matches `ADMIN_PASSWORD` environment variable.

**Function errors?**
→ Go to Netlify Dashboard → Functions → View real-time logs

---

## Free Tier Limits (Netlify)
- Functions: 125,000 invocations/month (more than enough)
- Blobs: 1GB storage (dashboard JSON is ~200KB)
- Bandwidth: 100GB/month
- Everything needed is within the free tier ✅
