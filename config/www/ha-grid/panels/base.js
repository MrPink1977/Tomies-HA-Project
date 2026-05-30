export function createPanelShell(panelConfig) {
  const panel = document.createElement("section");
  panel.className = "panel";
  panel.id = `panel-${panelConfig.id}`;
  panel.dataset.panelId = panelConfig.id;
  panel.dataset.accent = panelConfig.accent || "amber";

  panel.innerHTML = `
    <div class="panel-label">
      <div class="panel-name">${escapeHtml(panelConfig.title)}</div>
      <div class="panel-meta">
        <span class="live-badge">LIVE</span>
        <span>${escapeHtml(panelConfig.subtitle)}</span>
        <button class="expand-btn" type="button" data-expand>${panelButtonText(false)}</button>
      </div>
    </div>
    <div class="panel-content"></div>
  `;

  return panel;
}

export function createLoader(text) {
  const loader = document.createElement("div");
  loader.className = "loading-overlay";
  loader.innerHTML = `
    <div class="loader-ring"></div>
    <div class="loader-text">${escapeHtml(text)}</div>
  `;
  return loader;
}

export function hideLoader(loader) {
  if (loader) loader.classList.add("hidden");
}

export function panelButtonText(fullscreen) {
  return fullscreen ? "[ COLLAPSE ]" : "[ EXPAND ]";
}

export function cacheBustedUrl(src, localBase) {
  const joiner = src.includes("?") ? "&" : "?";
  return `${localBase}/${src}${joiner}v=${Date.now()}`;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}
