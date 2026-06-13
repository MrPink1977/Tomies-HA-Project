export const appConfig = {
  title: "FBIVAN",
  subtitle: "COMMAND GRID",
  cameraSnapshotStorageKey: "haGridCameraSnapshotUrl",
  cameraEntities: [
    "camera.reolink_snapshots_fluent",
    "camera.reolink_fluent",
    "camera.esp32s3_cam",
    "camera.dfrobot_ai_camera_voice_camera"
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
    { id: "mesh", label: "Mesh", entity: "sensor.active_nodes" },
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
      id: "field-mesh",
      accent: "mesh",
      type: "mesh",
      title: "Field Mesh",
      subtitle: "LORA RELAY // DRIVEWAY SENSOR NET",
      meshNodes: [
        {
          id: "!f669c5d0",
          label: "WarRoom-Base",
          shortName: "BASE",
          role: "MQTT / HA"
        },
        {
          id: "!ba0dd6f4",
          label: "TripleSixRanch",
          shortName: "TSR1",
          role: "ROOF RELAY"
        },
        {
          id: "!9990826d",
          label: "TripleSixRanch2",
          shortName: "TSR2",
          role: "DRIVE RELAY"
        },
        {
          id: "!f66aa864",
          label: "Driveway-PIR",
          shortName: "DRWY",
          role: "PRIVATE PIR",
          private: true
        }
      ],
      computeEntities: {
        gpuUtil: ["sensor.gpu_utilization", "sensor.fbivan_gpuload"],
        gpuTemp: ["sensor.gpu_temperature", "sensor.fbivan_gputemperature"],
        vramPct: ["sensor.gpu_vram_percent"],
        cpuPct: ["sensor.host_cpu_percent", "sensor.fbivan_cpuload"],
        ramPct: ["sensor.host_ram_percent", "sensor.fbivan_memoryusage"]
      }
    }
  ]
};
