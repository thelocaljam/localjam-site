# The Local Jam — live editing setup (Cloudflare + Decap CMS)

This turns the site into one your bandmates can edit live from a browser, with a
password login — no files to download or upload. Here's the shape of it:

- **Your site files** live in a **GitHub** repository (free).
- **Cloudflare Pages** hosts the site and automatically re-publishes whenever
  the files change (free).
- The **`/admin`** page is **Decap CMS** — the friendly editor your band logs into.
- **DecapBridge** handles the login (free for up to 3 sites and 10 people),
  so nobody needs a GitHub account — just an email and password.

When someone edits in `/admin` and clicks **Publish**, it saves to GitHub,
Cloudflare rebuilds, and the live site updates in about a minute.

> One-time setup is ~15 minutes. After that, editing is instant and code-free.

---

## What's in this folder

```
index.html            ← the website
content/site.json     ← all the words/photos/shows (the CMS edits this)
admin/index.html      ← the editor page (loads Decap CMS)
admin/config.yml      ← tells the editor what's editable  ← you'll paste 1 block here
images/uploads/       ← where photos & audio uploaded in the CMS are stored
```

---

## Step 1 — Put the files on GitHub

1. Create a free account at **github.com** if you don't have one.
2. Click **New repository**. Name it something like `localjam-site`. Keep it
   **Public** (Cloudflare's free tier works with private too, but public is simplest).
   Don't add a README. Click **Create repository**.
3. On the new repo page, click **"uploading an existing file."** Drag in the
   **contents of this folder** (the `index.html`, the `content`, `admin`, and
   `images` folders — not the folder itself). Click **Commit changes**.

Your repo should now show `index.html`, `content/`, `admin/`, `images/` at the top level.

---

## Step 2 — Put it online with Cloudflare Pages

1. Create a free account at **dash.cloudflare.com**.
2. In the left menu choose **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize GitHub and pick your `localjam-site` repo.
4. On the build settings screen:
   - **Framework preset:** `None`
   - **Build command:** leave **empty**
   - **Build output directory:** `/`
5. Click **Save and Deploy**. After a minute you'll get a URL like
   `https://localjam-site.pages.dev`. That's your live site. 🎉

(You can add your real domain later under the project's **Custom domains** tab.)

---

## Step 3 — Make a GitHub access token (so the editor can save)

DecapBridge needs permission to save edits to your repo.

1. Go to **github.com/settings/tokens** → **Fine-grained tokens** → **Generate new token**.
2. Name it `decap`, set expiration to **No expiration** (or a long date).
3. **Repository access:** *Only select repositories* → choose `localjam-site`.
4. **Permissions:** expand *Repository permissions*, set **Contents → Read and write**.
5. **Generate token** and copy it (you won't see it again).

---

## Step 4 — Connect DecapBridge (the login)

1. Sign up free at **decapbridge.com**.
2. **Add a site:**
   - **Git provider:** GitHub
   - **Git repository:** `your-github-username/localjam-site`
   - **Git access token:** paste the token from Step 3
   - **Decap CMS login URL:** `https://localjam-site.pages.dev/admin/index.html`
     (use your real Cloudflare URL)
   - **Auth type:** **Classic** (email + password — simplest) or **PKCE**
     (adds "Login with Google / Microsoft")
3. Click **Create site.** DecapBridge shows you a small **`backend:` block**.
   **Copy it.**
4. In your GitHub repo, open **`admin/config.yml`**, click the pencil ✏️ to edit,
   and **replace the placeholder `backend:` block at the top** (everything from
   `backend:` down to the end of the `commit_messages:` lines) with the block
   DecapBridge gave you. Commit the change.
5. Also in `config.yml`, update the two `https://YOUR-SITE.pages.dev` lines near
   the top to your real Cloudflare URL. Commit.

Wait ~1 minute for Cloudflare to redeploy, then visit
`https://localjam-site.pages.dev/admin/` — you should see a **login**.

---

## Step 5 — Invite the band

In DecapBridge → your site → **Manage collaborators**, enter a bandmate's email
and hit send. They get an email, set a password (or pick Google/Microsoft), and
they're in. Free plan allows **10 collaborators**.

---

## Day-to-day: how to edit

1. Go to **yoursite.com/admin/** and log in.
2. Open **Website → The Local Jam — all content.**
3. Edit any section — add a show, drag in a photo, change text, add a gallery image.
4. Click **Publish.** The live site updates in about a minute.

That's it. No downloads, no uploads, no code.

---

## Good to know

- **Photos & audio** are now uploaded right inside the CMS (the "Image"/"File"
  buttons). They're saved as real files in `images/uploads/` and linked
  automatically — no more files baked into the page. Keep audio clips short and
  use a handful of right-sized photos so the site stays fast.
- **Hero photos** become the full-screen background (they crossfade if you add
  several). The **Gallery** section stays hidden until you add at least one photo,
  and the **Tip** buttons appear once you fill in a Venmo handle under *Contact & tips.*
- **Custom domain:** add it in Cloudflare Pages → your project → *Custom domains.*
  Then update the login URL in DecapBridge and the `site_url` lines in `config.yml`
  to match.
- **The offline editor** (`editor.html` from before) still works if you ever want
  to edit without internet, but with this setup the live `/admin` is the real one —
  treat `content/site.json` as the source of truth.

## If something's off

- **Login page is blank / won't load:** make sure `admin/config.yml`'s `backend:`
  block is the one from DecapBridge (correct repo + site id), and that Cloudflare
  finished redeploying.
- **Edits don't appear:** check the Cloudflare Pages **Deployments** tab — each
  Publish should trigger a new deployment; give it a minute.
- **Can't upload a photo:** usually means the GitHub token is missing
  *Contents → Read and write*, or it expired. Make a new one and update it in
  DecapBridge.
