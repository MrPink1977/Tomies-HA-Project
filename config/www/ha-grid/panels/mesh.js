import { escapeHtml } from "./base.js";

const WS = "meshtastic_ui";
const REFRESH_MS = 30000;

export function renderMeshPanel(panel, panelConfig, context) {
  const content = panel.querySelector(".panel-content");
  content.innerHTML = `
    <div class="mesh-panel">
      <div class="mesh-topline">
        <div>
          <div class="mesh-kicker">RANCH MESH</div>
          <div class="mesh-route">BASE &gt; TSR1 &gt; TSR2 &gt; DRIVEWAY</div>
        </div>
        <div class="mesh-state" data-mesh-state>BOOTING</div>
      </div>
      <div class="mesh-metrics" data-mesh-metrics></div>
      <div class="mesh-route-map" data-mesh-route></div>
      <div class="mesh-node-grid" data-mesh-nodes></div>
      <div class="mesh-log" data-mesh-log></div>
    </div>
  `;

  const state = {
    radios: [],
    gateway: null,
    stats: null,
    nodes: {},
    messages: []
  };

  renderStatic(panel, panelConfig, state);

  if (!context.ha.hasToken) {
    panel.querySelector("[data-mesh-state]").textContent = "HA TOKEN NEEDED";
    return;
  }

  const refresh = () => refreshMesh(panel, panelConfig, context, state);
  context.ha.addEventListener("connection-status", event => {
    if (event.detail.name === "ha" && event.detail.online) refresh();
  });

  refresh();
  window.setInterval(refresh, REFRESH_MS);

  context.ha.subscribeCommand(`${WS}/subscribe`, {}, event => {
    if (event) {
      state.messages = [normalizeMessage(event), ...state.messages].slice(0, 8);
      renderStatic(panel, panelConfig, state);
    }
  }).catch(() => {});

  context.ha.subscribeCommand(`${WS}/subscribe_nodes`, {}, event => {
    if (event?.node_id && event.data) {
      state.nodes[event.node_id] = event.data;
      renderStatic(panel, panelConfig, state);
    }
  }).catch(() => {});
}

async function refreshMesh(panel, panelConfig, context, state) {
  try {
    const [radios, gateways, stats, nodes, messages] = await Promise.all([
      context.ha.sendCommand(`${WS}/radios`),
      context.ha.sendCommand(`${WS}/gateways`),
      context.ha.sendCommand(`${WS}/stats`),
      context.ha.sendCommand(`${WS}/nodes`),
      context.ha.sendCommand(`${WS}/messages`)
    ]);

    state.radios = radios.radios || [];
    state.gateway = gateways.gateways?.[0] || null;
    state.stats = stats || null;
    state.nodes = nodes.nodes || {};
    state.messages = collectRecentMessages(messages.messages || {});
    renderStatic(panel, panelConfig, state);
    panel.querySelector("[data-mesh-state]").textContent = state.gateway?.state?.toUpperCase() || "ONLINE";
  } catch (error) {
    console.warn("Mesh panel refresh failed", error);
    panel.querySelector("[data-mesh-state]").textContent = "OFFLINE";
  }
}

function renderStatic(panel, panelConfig, state) {
  renderMetrics(panel, state);
  renderRoute(panel, panelConfig, state);
  renderNodes(panel, panelConfig, state);
  renderLog(panel, state);
}

function renderMetrics(panel, state) {
  const metrics = panel.querySelector("[data-mesh-metrics]");
  const gateway = state.gateway;
  const sensors = gateway?.sensors || {};
  const values = [
    ["RADIO", gateway?.name || "WarRoom-Base"],
    ["MSG TODAY", state.stats?.messages_today ?? "--"],
    ["ACTIVE", state.stats?.active_nodes ?? "--"],
    ["RX/TX", compactPair(sensors.packets_rx, sensors.packets_tx)],
    ["UTIL", percent(sensors.channel_utilization)]
  ];
  metrics.innerHTML = values.map(([label, value]) => `
    <div class="mesh-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
}

function renderRoute(panel, panelConfig, state) {
  const route = panel.querySelector("[data-mesh-route]");
  const nodes = panelConfig.meshNodes || [];
  route.innerHTML = nodes.map((node, index) => {
    const live = findNode(state.nodes, node);
    const age = ageLabel(live?._last_seen);
    return `
      <div class="mesh-hop ${node.private ? "private" : ""}">
        <div class="mesh-hop-dot ${age.ok ? "ok" : age.warn ? "warn" : "off"}"></div>
        <div class="mesh-hop-name">${escapeHtml(node.shortName)}</div>
        <div class="mesh-hop-sub">${escapeHtml(age.text)}</div>
      </div>
      ${index < nodes.length - 1 ? `<div class="mesh-link"></div>` : ""}
    `;
  }).join("");
}

function renderNodes(panel, panelConfig, state) {
  const wrap = panel.querySelector("[data-mesh-nodes]");
  wrap.innerHTML = (panelConfig.meshNodes || []).map(node => {
    const live = findNode(state.nodes, node);
    const age = ageLabel(live?._last_seen);
    return `
      <article class="mesh-node ${age.ok ? "online" : age.warn ? "stale" : "offline"}">
        <div class="mesh-node-head">
          <strong>${escapeHtml(node.label)}</strong>
          <span>${escapeHtml(node.role)}</span>
        </div>
        <div class="mesh-node-body">
          <div><span>Seen</span><b>${escapeHtml(age.text)}</b></div>
          <div><span>Battery</span><b>${escapeHtml(battery(live?.battery))}</b></div>
          <div><span>SNR</span><b>${escapeHtml(db(live?.snr))}</b></div>
          <div><span>Hops</span><b>${escapeHtml(live?.hops ?? "--")}</b></div>
        </div>
      </article>
    `;
  }).join("");
}

function renderLog(panel, state) {
  const log = panel.querySelector("[data-mesh-log]");
  const messages = state.messages.slice(0, 5);
  log.innerHTML = `
    <div class="mesh-log-title">RECENT RF TRAFFIC</div>
    ${messages.length ? messages.map(message => `
      <div class="mesh-log-row">
        <span>${escapeHtml(message.channel)}</span>
        <b>${escapeHtml(message.from)}</b>
        <em>${escapeHtml(message.text)}</em>
      </div>
    `).join("") : `<div class="mesh-log-empty">Waiting for mesh traffic...</div>`}
  `;
}

function findNode(nodes, config) {
  if (config.id && nodes[config.id]) return nodes[config.id];
  return Object.values(nodes).find(node => {
    const names = [node.name, node.short_name].filter(Boolean).map(value => value.toLowerCase());
    return names.includes(config.label.toLowerCase()) || names.includes(config.shortName.toLowerCase());
  }) || null;
}

function collectRecentMessages(channels) {
  return Object.entries(channels)
    .flatMap(([channel, messages]) => messages.map(message => normalizeMessage({ ...message, channel })))
    .sort((a, b) => b.timestampMs - a.timestampMs)
    .slice(0, 8);
}

function normalizeMessage(message) {
  const text = String(message.text || "").replace(/\s+/g, " ").trim();
  return {
    channel: message.channel === "1" ? "LONGFAST" : "PRIVATE",
    from: message.from || "mesh",
    text: text || "packet",
    timestampMs: Date.parse(message.timestamp || message.time || "") || Date.now()
  };
}

function ageLabel(value) {
  if (!value) return { text: "no data", ok: false, warn: false };
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60000));
  if (minutes < 2) return { text: "now", ok: true, warn: false };
  if (minutes < 60) return { text: `${minutes}m`, ok: true, warn: false };
  const hours = Math.round(minutes / 60);
  if (hours < 24) return { text: `${hours}h`, ok: false, warn: true };
  return { text: `${Math.round(hours / 24)}d`, ok: false, warn: false };
}

function battery(value) {
  if (value === undefined || value === null) return "--";
  if (Number(value) > 100) return "USB";
  return `${Math.round(Number(value))}%`;
}

function db(value) {
  return value === undefined || value === null ? "--" : `${Number(value).toFixed(1)} dB`;
}

function percent(value) {
  return value === undefined || value === null ? "--" : `${Number(value).toFixed(1)}%`;
}

function compactPair(a, b) {
  if (a === undefined && b === undefined) return "--";
  return `${a ?? 0}/${b ?? 0}`;
}
