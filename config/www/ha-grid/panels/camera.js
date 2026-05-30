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
  });

  wrap.append(loader, image);
  content.append(wrap);

  const refresh = () => {
    const src = getCameraSnapshotUrl(context);
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

function getCameraSnapshotUrl(context) {
  for (const entityId of context.config.cameraEntities) {
    const state = context.ha.getState(entityId);
    const entityPicture = state?.attributes?.entity_picture;
    if (entityPicture) return entityPicture;
  }

  if (context.localCameraSnapshotUrl) return context.localCameraSnapshotUrl;

  return window.localStorage.getItem(context.config.cameraSnapshotStorageKey) || "";
}
