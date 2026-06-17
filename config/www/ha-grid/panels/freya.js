import { cacheBustedUrl } from "./base.js";

export function renderFreyaPanel(panel, panelConfig, context) {
  const content = panel.querySelector(".panel-content");
  const wrap = document.createElement("div");
  wrap.className = "iframe-wrap";

  const iframe = document.createElement("iframe");
  iframe.id = "iframe-freya";
  iframe.title = "Freya live ops";
  iframe.loading = "lazy";
  iframe.src = cacheBustedUrl(panelConfig.src, context.localBase);

  wrap.append(iframe);
  content.append(wrap);
}
