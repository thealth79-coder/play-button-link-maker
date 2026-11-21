# Play Button Link Maker — Netlify one-click backend

## What this project does
- Visitors upload an image, enter a destination URL, title, description and custom slug.
- The browser converts the image to a 1080p JPEG.
- `POST /api/create` stores metadata and image in Netlify Blobs.
- A successful request returns `https://YOUR-SITE.netlify.app/your-slug`.
- `/:slug` serves a shareable HTML page with Open Graph/Twitter metadata.
- `/media/:slug` serves the stored image for social crawlers.

## Important
This is a Netlify Functions project, not a static-only drag-and-drop HTML page. Netlify must build the functions and install `@netlify/blobs`. Deploy it through a connected Git repository or Netlify CLI. Do not deploy this ZIP as a plain static Drop upload; that will not compile the functions.

## Deploy to the existing Netlify project
1. Extract this ZIP on your computer.
2. Create a new GitHub repository (or use an existing repository you control).
3. Upload the **contents** of this folder to the repository root: `index.html`, `netlify.toml`, `package.json`, and the `netlify/` folder.
4. In Netlify, open your existing project `effortless-truffle-9ffe8e`.
5. Go to Project configuration / Build & deploy / Continuous deployment and connect the GitHub repository. If the project already has a connected repository, add these files to that same repository instead.
6. Build settings: Build command can be left empty; Publish directory should be `.`. The included `netlify.toml` defines the functions directory.
7. Trigger a production deploy and wait until it succeeds.
8. Open the site, create a test link. Example slug: `test-link-01`.

## Free tier notes
Netlify Functions and Blobs have plan-specific usage limits and may change. Free does not mean unlimited. Public upload endpoints can be abused; this starter includes file-size and input validation but is not a complete anti-spam system. Monitor Usage & billing. For a high-traffic public service, add CAPTCHA/rate limiting and a cleanup/expiry policy before launch.

## Security
Never paste your Netlify password or Personal Access Token into this project or a public chat. This version uses Netlify Blobs credentials automatically inside Netlify Functions; no personal token is required.
