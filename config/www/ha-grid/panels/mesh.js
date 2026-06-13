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
      <div class="mesh-systems" data-mesh-systems></div>
      <div class="mesh-node-table" data-mesh-nodes></div>
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

  renderStatic(panel, panelConfig, context, state);

  if (!context.ha.hasToken) {
    panel.querySelector("[data-mesh-state]").textContent = "HA TOKEN NEEDED";
    return;
  }

  const refresh = () => refreshMesh(panel, panelConfig, context, state);
  context.ha.addEventListener("connection-status", event => {
    if (event.detail.name === "ha" && event.detail.online) refresh();
  });
  context.ha.addEventListener("state-changed", event => {
    if (isComputeEntity(panelConfig, event.detail.entity_id)) {
      renderSystems(panel, panelConfig, context);
    }
  });

  refresh();
  window.setInterval(refresh, REFRESH_MS);

  context.ha.subscribeCommand(`${WS}/subscribe`, {}, event => {
    if (event) {
      state.messages = [normalizeMessage(event), ...state.messages].slice(0, 8);
      renderStatic(panel, panelConfig, context, state);
    }
  }).catch(() => {});

  context.ha.subscribeCommand(`${WS}/subscribe_nodes`, {}, event => {
    if (event?.node_id && event.data) {
      state.nodes[event.node_id] = event.data;
      renderStatic(panel, panelConfig, context, state);
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
    renderStatic(panel, panelConfig, context, state);
    panel.querySelector("[data-mesh-state]").textContent = state.gateway?.state?.toUpperCase() || "ONLINE";
  } catch (error) {
    console.warn("Mesh panel refresh failed", error);
    panel.querySelector("[data-mesh-state]").textContent = "OFFLINE";
  }
}

function renderStatic(panel, panelConfig, context, state) {
  renderMetrics(panel, state);
  renderRoute(panel, panelConfig, state);
  renderSystems(panel, panelConfig, context);
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

function renderSystems(panel, panelConfig, context) {
  const wrap = panel.querySelector("[data-mesh-systems]");
  if (!wrap) return;
  const compute = panelConfig.computeEntities || {};
  const gpuUtil = entityNumber(context, compute.gpuUtil);
  const gpuTemp = entityNumber(context, compute.gpuTemp);
  const vramPct = entityNumber(context, compute.vramPct);
  const cpuPct = entityNumber(context, compute.cpuPct);
  const ramPct = entityNumber(context, compute.ramPct);
  const rows = [
    ["GPU", pct(gpuUtil), level(gpuUtil, 85, 95)],
    ["VRAM", pct(vramPct), level(vramPct, 80, 90)],
    ["CPU", pct(cpuPct), level(cpuPct, 80, 92)],
    ["RAM", pct(ramPct), level(ramPct, 80, 92)],
    ["TEMP", gpuTemp === null ? "--" : `${Math.round(gpuTemp)}C`, level(gpuTemp, 74, 84)]
  ];

  wrap.innerHTML = `
    <div class="mesh-section-title">AI / COMPUTE</div>
    <div class="mesh-system-strip">
      ${rows.map(([label, value, status]) => `
        <div class="mesh-system ${status}">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `).join("")}
    </div>
  `;
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
  wrap.innerHTML = `
    <div class="mesh-section-title">NODE STATUS</div>
    ${(panelConfig.meshNodes || []).map(node => {
    const live = findNode(state.nodes, node);
    const age = ageLabel(live?._last_seen);
    return `
      <div class="mesh-node-row ${age.ok ? "online" : age.warn ? "stale" : "offline"}">
        <b>${escapeHtml(node.shortName)}</b>
        <span>${escapeHtml(node.role)}</span>
        <span>${escapeHtml(age.text)}</span>
        <span>${escapeHtml(battery(live?.battery))}</span>
        <span>${escapeHtml(db(live?.snr))}</span>
        <span>${escapeHtml(live?.hops ?? "--")}</span>
      </div>
    `;
  }).join("")}
  `;
}

function renderLog(panel, state) {
  const log = panel.querySelector("[data-mesh-log]");
  const messages = state.messages.slice(0, 3);
  log.innerHTML = `
    <div class="mesh-log-title">RF CHAT TRAFFIC</div>
    ${messages.length ? messages.map(message => `
      <div class="mesh-log-row ${message.stale ? "stale" : ""}">
        <span>${escapeHtml(message.channel)}</span>
        <b>${escapeHtml(message.from)}</b>
        <time>${escapeHtml(message.age)}</time>
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
  const timestampMs = Date.parse(message.timestamp || message.time || "") || Date.now();
  const age = ageLabel(timestampMs);
  return {
    channel: message.channel === "1" ? "LONGFAST" : "PRIVATE",
    from: message._outgoing ? "OUT" : message.from || "mesh",
    text: text || "packet",
    timestampMs,
    age: age.text,
    stale: !age.ok && !age.warn
  };
}

function ageLabel(value) {
  if (!value) return { text: "no data", ok: false, warn: false };
  const timestamp = typeof value === "number" ? value : Date.parse(value);
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
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

function isComputeEntity(panelConfig, entityId) {
  return Object.values(panelConfig.computeEntities || {})
    .flat()
    .includes(entityId);
}

function entityNumber(context, ids = []) {
  if (!context?.ha) return null;
  for (const entityId of ids) {
    const value = Number(context.ha.getState(entityId)?.state);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function pct(value) {
  return value === null ? "--" : `${Math.round(value)}%`;
}

function level(value, warnAt, hotAt) {
  if (value === null) return "";
  if (value >= hotAt) return "hot";
  if (value >= warnAt) return "warn";
  return "ok";
}
