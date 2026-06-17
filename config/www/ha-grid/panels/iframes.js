import { cacheBustedUrl, createLoader, hideLoader } from "./base.js";

export function renderIframePanel(panel, panelConfig, context) {
  const content = panel.querySelector(".panel-content");
  const body = document.createElement("div");
  body.className = panelConfig.layout === "stack" ? "stack-body" : "split-body";

  panelConfig.frames.forEach((frame, index) => {
    const pane = document.createElement("div");
    pane.className = panelConfig.layout === "stack" ? "stack-pane" : "split-pane";

    const wrap = document.createElement("div");
    wrap.className = "iframe-wrap";

    const loader = createLoader(frame.loader || "Loading...");
    const iframe = document.createElement("iframe");
    iframe.title = frame.id;
    iframe.loading = "lazy";
    iframe.src = cacheBustedUrl(frame.src, context.localBase);
    iframe.addEventListener("load", () => hideLoader(loader));

    wrap.append(loader, iframe);
    pane.append(wrap);
    body.append(pane);

    if (index < panelConfig.frames.length - 1) {
      const divider = document.createElement("div");
      divider.className = panelConfig.layout === "stack" ? "stack-divider" : "split-divider";
      body.append(divider);
    }
  });

  content.append(body);
}
