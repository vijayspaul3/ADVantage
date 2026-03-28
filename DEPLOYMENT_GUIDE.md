# Advantage — Deployment Guide

A step-by-step guide to getting Advantage live on the internet for free. No technical background needed — just follow each step in order.

---

## What You're Setting Up

Advantage is a web app that:
- Pulls articles from 8 higher education / advancement news sources every hour
- Uses Google Gemini AI to write smart 60-word summaries and tag articles by topic
- Displays articles as swipeable cards with topic filters
- Is free to host and free to run

**Tools you'll use:**
- **GitHub** (free) — stores your code
- **Vercel** (free) — hosts your app and makes it live on the internet
- **Google AI Studio** (free) — gives you a Gemini API key for AI summaries

---

## STEP 1: Get a Gemini API Key (5 minutes)

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with your Google / work account
3. Click **"Create API Key"**
4. Select any Google Cloud project (or create one — it's free)
5. Copy the API key that appears — it will look like a long string of letters and numbers
6. **Save this key somewhere safe** (you'll need it in Step 4)

The free tier gives you 15 requests per minute and 1 million tokens per month — more than enough.

---

## STEP 2: Create a GitHub Account & Repository (10 minutes)

**If you don't have a GitHub account:**
1. Go to **https://github.com** and click **Sign Up**
2. Follow the prompts to create a free account

**Create a new repository:**
1. Once logged in, click the **"+"** button in the top-right corner
2. Click **"New repository"**
3. Name it **advantage**
4. Make sure **"Public"** is selected
5. Check the box that says **"Add a README file"**
6. Click **"Create repository"**

**Upload the project files:**
1. On your new repository page, click **"Add file"** → **"Upload files"**
2. Unzip the **advantage-project.zip** file you downloaded from Claude onto your computer
3. Drag ALL the files and folders from inside the unzipped folder into the upload area on GitHub
   - You should see: `package.json`, `next.config.js`, `.gitignore`, and folders `app/`, `components/`
4. Scroll down and click **"Commit changes"**
5. **Important:** You should see the following file structure in your repository:
   ```
   advantage/
   ├── .gitignore
   ├── next.config.js
   ├── package.json
   ├── app/
   │   ├── globals.css
   │   ├── layout.js
   │   ├── page.js
   │   └── api/
   │       ├── feeds/
   │       │   └── route.js
   │       └── summarize/
   │           └── route.js
   └── components/
       └── Advantage.js
   ```

**Note:** Do NOT upload the `.env.local` file to GitHub — it contains your secret API key. You'll add it directly in Vercel in Step 4.

---

## STEP 3: Connect Vercel to Your GitHub Repository (5 minutes)

1. Go to **https://vercel.com** and log in (or sign up with your GitHub account)
2. Click **"Add New..."** → **"Project"**
3. You'll see a list of your GitHub repositories — find **advantage** and click **"Import"**
4. On the configuration page:
   - **Framework Preset** should auto-detect as **Next.js** — if not, select it
   - Leave all other settings as default
5. **Don't click Deploy yet** — go to Step 4 first

---

## STEP 4: Add Your Gemini API Key to Vercel (2 minutes)

On the same Vercel project configuration page (before deploying):

1. Look for the **"Environment Variables"** section
2. Add the following:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** paste your Gemini API key from Step 1
3. Click **"Add"**
4. Now click **"Deploy"**

Vercel will take 1–2 minutes to build and deploy your app. When it's done, you'll see a green "Congratulations!" message and a URL like **advantage-xxxxx.vercel.app**.

---

## STEP 5: Visit Your Live App (1 minute)

1. Click the URL Vercel gave you — your app is now live!
2. You should see articles loading from your news sources
3. Try the topic filters, swipe through cards, and click "Read full article" links
4. The status bar will show "AI-enhanced" once Gemini has processed the summaries

**Share this URL with anyone** — it's a public website now.

---

## STEP 6 (Optional): Custom Domain Name

If you want a professional URL like **advantage.youruniversity.edu** instead of the Vercel default:

1. In your Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Type in your desired domain name and click **"Add"**
4. Vercel will give you DNS records (usually a CNAME record)
5. Add these records in your domain provider's settings (your IT team can help with this)

---

## How It Works — Plain English

| What happens | When | How |
|---|---|---|
| Articles are fetched from all 8 news sources | Every time someone visits the app (cached for 1 hour) | Vercel's server reads the RSS feeds — no CORS issues |
| Gemini AI writes summaries & tags topics | After articles load, in the background | Your server sends article titles to Gemini, gets back smart summaries |
| Articles display as cards | Immediately | Keyword-based tagging shows instantly; AI-enhanced summaries replace them once ready |

---

## Troubleshooting

**"No articles found"**
- Some news sites may block server-side RSS fetching or may not have RSS feeds. This is normal — the app works with whatever sources respond.
- Check your Vercel deployment logs: Dashboard → your project → **"Deployments"** → click the latest → **"Functions"** tab

**Articles show but no "AI-enhanced" label**
- Check that your `GEMINI_API_KEY` is correctly set in Vercel environment variables
- Go to Vercel Dashboard → your project → **"Settings"** → **"Environment Variables"** and verify

**Want to use your own custom logo?**
- Design your logo using a free tool like Canva (canva.com) — download it as a PNG with a transparent background
- In your GitHub repository, go to the `public/` folder
- Click the existing `logo.png` file, then click the pencil/edit icon, then "Delete file" and commit
- Click "Add file" → "Upload files" and upload your new logo as `logo.png`
- Vercel will automatically redeploy with your new logo within a minute
- For best results, make your logo wide (not square) — around 400×96 pixels works well

**Want to add or change news sources?**
- Edit the file `app/api/feeds/route.js` in your GitHub repository
- Find the `FEEDS` array at the top and add/remove entries
- Vercel will automatically redeploy when you save changes on GitHub

**Want to change topics?**
- Edit the `TOPICS` array in `components/Advantage.js`
- Update the matching topic list in `app/api/summarize/route.js`

---

## Costs

Everything in this setup is free:
- **Vercel** free tier: 100 GB bandwidth/month, unlimited deployments
- **GitHub** free tier: unlimited public repositories
- **Gemini API** free tier: 15 requests/minute, 1M tokens/month
- **RSS feeds**: free by design

For a university advancement team, you'll likely never hit any of these limits.

---

## Need Help?

If you get stuck at any step, come back to Claude with a screenshot or error message and I'll walk you through it.
