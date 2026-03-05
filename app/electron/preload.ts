import { contextBridge } from "electron";

// Экспортируем версии для отображения в приложении
contextBridge.exposeInMainWorld("electronAPI", {
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  platform: process.platform,
});
