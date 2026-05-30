export class HomeAssistantClient extends EventTarget {
  constructor({ baseUrl = window.location.origin } = {}) {
    super();
    this.baseUrl = baseUrl;
    this.token = readHomeAssistantToken();
    this.states = new Map();
    this.socket = null;
    this.nextMessageId = 1;
    this.connected = false;
  }

  get hasToken() {
    return Boolean(this.token);
  }

  getState(entityId) {
    return this.states.get(entityId) || null;
  }

  async start() {
    if (!this.token) {
      this.emitStatus("ha", false);
      return;
    }

    await this.loadStates();
    this.connectWebSocket();
  }

  async loadStates() {
    const response = await fetch(`${this.baseUrl}/api/states`, {
      headers: { Authorization: `Bearer ${this.token}` },
      cache: "no-store"
    });

    if (!response.ok) {
      this.emitStatus("ha", false);
      throw new Error(`Home Assistant state load failed: ${response.status}`);
    }

    const states = await response.json();
    for (const state of states) {
      this.states.set(state.entity_id, state);
    }

    this.emitStatus("ha", true);
    this.dispatchEvent(new CustomEvent("states-loaded", { detail: { states } }));
  }

  connectWebSocket() {
    if (!this.token) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/websocket`);
    this.socket = socket;

    socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);

      if (message.type === "auth_required") {
        socket.send(JSON.stringify({ type: "auth", access_token: this.token }));
      }

      if (message.type === "auth_ok") {
        this.connected = true;
        this.emitStatus("ha", true);
        socket.send(JSON.stringify({
          id: this.nextMessageId++,
          type: "subscribe_events",
          event_type: "state_changed"
        }));
      }

      if (message.type === "event" && message.event?.event_type === "state_changed") {
        this.handleStateChanged(message.event.data);
      }
    });

    socket.addEventListener("close", () => {
      this.connected = false;
      this.emitStatus("ha", false);
      window.setTimeout(() => this.connectWebSocket(), 4000);
    });

    socket.addEventListener("error", () => {
      this.connected = false;
      this.emitStatus("ha", false);
    });
  }

  handleStateChanged(data) {
    if (!data?.entity_id || !data.new_state) return;
    this.states.set(data.entity_id, data.new_state);
    this.dispatchEvent(new CustomEvent("state-changed", { detail: data }));
  }

  emitStatus(name, online) {
    this.dispatchEvent(new CustomEvent("connection-status", {
      detail: { name, online }
    }));
  }
}

export function readHomeAssistantToken() {
  try {
    const raw = window.localStorage.getItem("hassTokens");
    return raw ? JSON.parse(raw).access_token || null : null;
  } catch {
    return null;
  }
}
