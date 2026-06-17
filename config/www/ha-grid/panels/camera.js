import { createLoader, hideLoader } from "./base.js";

export function renderCameraPanel(panel, panelConfig, context) {
  const content = panel.querySelector(".panel-content");
  const wrap = document.createElement("div");
  wrap.className = "iframe-wrap camera-wrap";

  const loader = createLoader(panelConfig.loader || "Acquiring Feed...");
  const image = document.createElement("img");
  image.className = "camera-feed";
  image.alt = panelConfig.title;

  image.addEventListener("load", () => {
    image.style.opacity = "1";
    hideLoader(loader);
  });

  image.addEventListener("error", () => {
    image.style.opacity = "0.18";
    loader.classList.remove("hidden");
    const text = loader.querySelector(".loader-text");
    if (text) text.textContent = "Waiting For Camera...";
    const urls = getCameraSnapshotUrls(context);
    if (urls.length > 1) {
      cameraIndex = (cameraIndex + 1) % urls.length;
      refresh();
    }
  });

  wrap.append(loader, image);
  content.append(wrap);

  let cameraIndex = 0;

  const refresh = () => {
    const urls = getCameraSnapshotUrls(context);
    if (!urls.length) return;

    if (cameraIndex >= urls.length) cameraIndex = 0;
    const src = urls[cameraIndex];
    if (src) {
      image.src = `${src}${src.includes("?") ? "&" : "?"}rs=${Date.now()}`;
    }
  };

  refresh();
  context.ha.addEventListener("states-loaded", refresh);
  context.ha.addEventListener("state-changed", event => {
    if (context.config.cameraEntities.includes(event.detail.entity_id)) refresh();
  });
  window.setInterval(refresh, context.config.cameraRefreshMs);
}

function getCameraSnapshotUrls(context) {
  const urls = [];

  const storedUrl = window.localStorage.getItem(context.config.cameraSnapshotStorageKey);
  if (storedUrl) urls.push(storedUrl);

  const entityUrls = [];
  for (const entityId of context.config.cameraEntities) {
    const state = context.ha.getState(entityId);
    if (["unknown", "unavailable", "none"].includes(String(state?.state || "").toLowerCase())) continue;
    const entityPicture = state?.attributes?.entity_picture;
    if (entityPicture) entityUrls.push(entityPicture);
  }

  if (context.ha.hasToken) urls.push(...entityUrls);
  if (context.localCameraSnapshotUrl) urls.push(context.localCameraSnapshotUrl);
  if (!context.ha.hasToken) urls.push(...entityUrls);

  urls.push(...(context.config.cameraFallbackUrls || []));

  return [...new Set(urls)];
}
