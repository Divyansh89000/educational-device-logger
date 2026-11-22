# Educational IP & Device Diagnostics Logger

A consent-based demonstration using GitHub Pages (static frontend), Cloudflare Workers (API), and Cloudflare D1 (report storage).

## Privacy and scope

- The visitor sees a disclosure and must actively check consent before submission.
- The Worker records the public IP observed in `CF-Connecting-IP`.
- The browser sends basic device/browser diagnostics and **names/counts only** for localStorage/sessionStorage keys, visible cookie names, and IndexedDB database names.
- It does not send local/session storage values, cookie values, HttpOnly cookies, passwords, form contents, browser history, or data belonging to other origins.
- Browser/OS identification is approximate and may be reduced by browser privacy features.
- Use only where you have a legitimate purpose and have informed visitors. Set an appropriate retention period and delete reports when no longer needed.

## 1. Create the Cloudflare database

Install Wrangler and authenticate:

```bash
npm install -g wrangler
wrangler login
cd worker
wrangler d1 create device-logger-db
```

Copy the returned `database_id` into `worker/wrangler.toml` (replace `REPLACE_WITH_DATABASE_ID`).

Create the table:

```bash
wrangler d1 execute device-logger-db --remote --file=schema.sql
```

Set a long random administrator token (do not commit it to GitHub):

```bash
wrangler secret put ADMIN_TOKEN
```

When prompted, paste a long random value. Save it in a password manager. This token is required to view reports.

## 2. Deploy the Worker

From the `worker` directory:

```bash
wrangler deploy
```

Copy the Worker URL, for example `https://educational-device-logger.YOUR-SUBDOMAIN.workers.dev`.

## 3. Configure GitHub Pages frontend

Edit `config.js` in the repository root and replace the placeholder:

```js
window.APP_CONFIG = { API_BASE: "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev" };
```

Edit `worker/wrangler.toml` and set `ALLOWED_ORIGIN` to your exact GitHub Pages origin, for example `https://YOURNAME.github.io`. For a project site, the browser Origin is still normally `https://YOURNAME.github.io`, not the `/repository` path.

Redeploy after changing the origin:

```bash
cd worker
wrangler deploy
```

Push the root frontend files (`index.html`, `dashboard.html`, `config.js`, `app.js`, `dashboard.js`, `style.css`) to your GitHub repository. In GitHub, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save. Wait for the Pages URL to become available.

If your GitHub Pages site uses a custom domain, set `ALLOWED_ORIGIN` to that exact origin instead.

## 4. Use it

- Share your GitHub Pages `index.html` URL with test visitors. After consent and a successful report submission, they are redirected to Amazon India.
- Open `dashboard.html` on the same Pages site.
- Enter the `ADMIN_TOKEN` you created and choose **Load reports**.
- The token is held only in the dashboard page's memory; clearing or closing the page removes it from that page.

## 5. Test / troubleshoot

- `GET https://YOUR-WORKER.../` returns Not found; this is expected.
- A browser console CORS error usually means `ALLOWED_ORIGIN` does not exactly match the frontend origin. Update it and redeploy.
- A 401 on the dashboard means the admin token is wrong or missing.
- A failed report is not redirected; the page shows an error so the visitor is not silently sent away.
- Cloudflare D1 stores reports until you delete them. To inspect or delete records, use the Cloudflare dashboard or Wrangler D1 commands.

## Deployment checklist

- [ ] Replace D1 database ID in `worker/wrangler.toml`
- [ ] Set a strong `ADMIN_TOKEN` using `wrangler secret put`
- [ ] Set exact `ALLOWED_ORIGIN`
- [ ] Deploy Worker
- [ ] Set Worker URL in `config.js`
- [ ] Publish frontend using GitHub Pages
- [ ] Test consent, report receipt, dashboard login, and Amazon India redirect
- [ ] Publish a contact/privacy notice and define report retention

## Important limitations

GitHub Pages cannot run a private backend or safely store admin credentials. That is why the API and database live on Cloudflare. Never put `ADMIN_TOKEN` in frontend JavaScript or commit it to the repository.
