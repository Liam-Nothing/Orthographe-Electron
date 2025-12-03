const { contextBridge, ipcRenderer } = require('electron');

// Exposer une API sécurisée au renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Invocations IPC (requêtes)
  getDebugInfo: () => ipcRenderer.invoke('get-debug-info'),
  getGitHubReleases: () => ipcRenderer.invoke('get-github-releases'),
  
  // Écouteurs d'événements (avec cleanup)
  onEnvVariables: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('env-variables', subscription);
    return () => ipcRenderer.removeListener('env-variables', subscription);
  },
  
  onUpdateDebug: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('update-debug', subscription);
    return () => ipcRenderer.removeListener('update-debug', subscription);
  },
  
  onNavigateTo: (callback) => {
    const subscription = (event, page) => callback(page);
    ipcRenderer.on('navigate-to', subscription);
    return () => ipcRenderer.removeListener('navigate-to', subscription);
  },
  
  onUpdateAvailable: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('update_available', subscription);
    return () => ipcRenderer.removeListener('update_available', subscription);
  },
  
  onUpdateDownloaded: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('update_downloaded', subscription);
    return () => ipcRenderer.removeListener('update_downloaded', subscription);
  },
  
  onDownloadProgress: (callback) => {
    const subscription = (event, percent) => callback(percent);
    ipcRenderer.on('download-progress', subscription);
    return () => ipcRenderer.removeListener('download-progress', subscription);
  }
});

// Log pour confirmer que le preload est chargé
console.log('[Preload] Electron API exposed securely');

