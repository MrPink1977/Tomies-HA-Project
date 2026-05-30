const CACHE_BUST = new URL(import.meta.url).searchParams.get("v")
  || window.HA_GRID_CACHE_BUST
  || Date.now().toString();

const [
  { appConfig },
  { HomeAssistantClient },
  { createPanelShell, panelButtonText },
  { renderCameraPanel },
  { renderFreyaPanel },
  { renderIframePanel }
] = await Promise.all([
  import(`./config.js?v=${CACHE_BUST}`),
  import(`./ha-client.js?v=${CACHE_BUST}`),
  import(`./panels/base.js?v=${CACHE_BUST}`),
  import(`./panels/camera.js?v=${CACHE_BUST}`),
  import(`./panels/freya.js?v=${CACHE_BUST}`),
  import(`./panels/iframes.js?v=${CACHE_BUST}`)
]);

const localCameraConfig = await import(`./local-camera.js?v=${CACHE_BUST}`)
  .catch(() => ({ cameraSnapshotUrl: "" }));

const HA_URL = window.location.origin && window.location.origin !== "null"
  ? window.location.origin
  : "http://localhost:8123";
const IS_SANDBOX = ["8109", "5500"].includes(window.location.port);
const LOCAL_BASE = IS_SANDBOX ? "." : `${HA_URL}/local`;

const context = {
  config: appConfig,
  localBase: LOCAL_BASE,
  localCameraSnapshotUrl: localCameraConfig.cameraSnapshotUrl || "",
  ha: new HomeAssistantClient({ baseUrl: HA_URL })
};

let fullscreenPanel = null;

boot();

function boot() {
  renderStatusDots();
  renderPanels();
  bindFullscreenKeys();
  updateClock();
  window.setInterval(updateClock, 1000);
  window.setTimeout(hideAllLoaders, appConfig.loaderTimeoutMs);
  wireHomeAssistantStatus();
  context.ha.start().catch(error => {
    console.warn(error);
    setStatusDot("ha", "off");
  });
}

function renderStatusDots() {
  const dots = document.getElementById("status-dots");
  dots.innerHTML = "";

  for (const item of appConfig.statusItems) {
    const dot = document.createElement("div");
    dot.className = `sdot ${item.warnByDefault ? "warn" : ""}`;
    dot.dataset.statusId = item.id;
    dot.textContent = item.label;
    dots.append(dot);
  }
}

function renderPanels() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (const panelConfig of appConfig.panels) {
    const panel = createPanelShell(panelConfig);
    grid.append(panel);

    if (panelConfig.type === "camera") {
      renderCameraPanel(panel, panelConfig, context);
    } else if (panelConfig.type === "freya") {
      renderFreyaPanel(panel, panelConfig, context);
    } else {
      renderIframePanel(panel, panelConfig, context);
    }

    panel.querySelector("[data-expand]").addEventListener("click", () => {
      toggleFullscreen(panel);
    });
  }
}

function updateClock() {
  const now = new Date();
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  document.getElementById("clock").textContent =
    `${now.toLocaleTimeString("en-US", { hour12: false })}  ${days[now.getDay()]} ${now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}`;
}

function hideAllLoaders() {
  document.querySelectorAll(".loading-overlay").forEach(loader => {
    loader.classList.add("hidden");
  });
}

function toggleFullscreen(panel) {
  if (fullscreenPanel && fullscreenPanel !== panel) {
    fullscreenPanel.classList.remove("fullscreen");
    fullscreenPanel.querySelector("[data-expand]").textContent = panelButtonText(false);
  }

  const willFullscreen = !panel.classList.contains("fullscreen");
  panel.classList.toggle("fullscreen", willFullscreen);
  panel.querySelector("[data-expand]").textContent = panelButtonText(willFullscreen);
  fullscreenPanel = willFullscreen ? panel : null;
}

function bindFullscreenKeys() {
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && fullscreenPanel) {
      toggleFullscreen(fullscreenPanel);
    }
  });
}

function wireHomeAssistantStatus() {
  setStatusDot("ha", context.ha.hasToken ? "on" : "off");

  context.ha.addEventListener("connection-status", event => {
    if (event.detail.name === "ha") {
      setStatusDot("ha", event.detail.online ? "on" : "off");
    }
  });
}

function setStatusDot(id, state) {
  const dot = document.querySelector(`[data-status-id="${id}"]`);
  if (!dot) return;
  dot.classList.remove("warn", "off");
  if (state === "warn") dot.classList.add("warn");
  if (state === "off") dot.classList.add("off");
}
