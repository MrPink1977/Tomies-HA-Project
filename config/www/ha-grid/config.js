export const appConfig = {
  title: "FBIVAN",
  subtitle: "COMMAND GRID",
  cameraSnapshotStorageKey: "haGridCameraSnapshotUrl",
  cameraEntities: [
    "camera.esp32s3_cam",
    "camera.reolink_snapshots_fluent",
    "camera.reolink_fluent"
  ],
  cameraFallbackUrls: [
    "http://192.168.0.97/capture"
  ],
  loaderTimeoutMs: 10000,
  cameraRefreshMs: 3000,
  statusItems: [
    { id: "ha", label: "HA Online", kind: "ha" },
    { id: "ollama", label: "Ollama", kind: "ollama", warnByDefault: true },
    { id: "mqtt", label: "MQTT", entity: "sensor.sem_b_active_power" },
    { id: "cameras", label: "Cameras", kind: "camera" }
  ],
  panels: [
    {
      id: "camera",
      accent: "camera",
      type: "camera",
      title: "Front Door",
      subtitle: "REOLINK // AI DETECT",
      loader: "Acquiring Feed..."
    },
    {
      id: "power-energy",
      accent: "energy",
      type: "iframes",
      title: "Power & Energy",
      subtitle: "SOLAR / POWER CENTER",
      layout: "split",
      frames: [
        { id: "solar", src: "solar-mini.html", loader: "Loading Solar..." },
        { id: "power", src: "power-center-mini.html", loader: "Loading Circuits..." }
      ]
    },
    {
      id: "greenhouse",
      accent: "greenhouse",
      type: "iframes",
      title: "Greenhouse & Weather",
      subtitle: "AC INFINITY // ENV + WEATHER",
      layout: "split",
      frames: [
        { id: "greenhouse", src: "greenhouse-dashboard.html", loader: "Reading Sensors..." },
        { id: "weather", src: "weather-dashboard.html", loader: "Loading Weather..." }
      ]
    },
    {
      id: "freya",
      accent: "freya",
      type: "freya",
      title: "FREYA",
      subtitle: "NEURAL INTELLIGENCE // SYSTEM STATUS",
      src: "freya-panel.html"
    }
  ]
};
