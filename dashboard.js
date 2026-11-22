const tokenInput = document.getElementById("token");
const loadButton = document.getElementById("load");
const logoutButton = document.getElementById("logout");
const rows = document.getElementById("rows");
const statusEl = document.getElementById("status");
function cell(value) {
  const td = document.createElement("td");
  td.textContent = value == null || value === "" ? "—" : String(value);
  return td;
}
loadButton.addEventListener("click", async () => {
  const token = tokenInput.value.trim();
  if (!token) { statusEl.textContent = "Enter your admin token."; return; }
  statusEl.textContent = "Loading…";
  loadButton.disabled = true;
  try {
    const response = await fetch(`${window.APP_CONFIG.API_BASE}/reports?limit=200`, {
      headers: { "Authorization": `Bearer ${token}` }, cache: "no-store"
    });
    if (!response.ok) throw new Error(response.status === 401 ? "Invalid admin token." : `Server returned ${response.status}`);
    const data = await response.json();
    rows.replaceChildren();
    if (!data.reports.length) { const tr = document.createElement("tr"); const td = cell("No reports yet."); td.colSpan = 7; tr.append(td); rows.append(tr); }
    for (const r of data.reports) {
      const tr = document.createElement("tr");
      const d = r.details || {};
      const storage = d.storage || {};
      tr.append(
        cell(new Date(r.created_at).toLocaleString()),
        cell(r.ip),
        cell(`${d.browserHints?.brands?.map(x => `${x.brand} ${x.version}`).join(", ") || "Browser unknown"} / ${d.browserHints?.platform || d.platform || "OS unknown"}`),
        cell(d.browserHints?.mobile ? "Mobile" : (d.touchPoints > 0 ? "Touch-capable" : "Desktop/unknown")),
        cell(d.screen ? `${d.screen.width} × ${d.screen.height}` : "—"),
        cell(d.timezone),
        cell(`local: ${d.localStorage?.count ?? 0}, session: ${d.sessionStorage?.count ?? 0}, cookies: ${(d.cookieNames || []).length}, IDB: ${(d.indexedDbNames || []).length}`)
      );
      rows.append(tr);
    }
    statusEl.textContent = `Loaded ${data.reports.length} report(s).`;
  } catch (err) {
    statusEl.textContent = err.message;
  } finally { loadButton.disabled = false; }
});
logoutButton.addEventListener("click", () => { tokenInput.value = ""; rows.replaceChildren(); statusEl.textContent = "Token cleared from this page."; });