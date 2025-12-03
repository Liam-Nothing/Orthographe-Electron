const { contextBridge, ipcRenderer } = require('electron');

// Exposer une API sécurisée au renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // === CONFIGURATION ===
  checkConfig: () => ipcRenderer.invoke('check-config'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  getModel: () => ipcRenderer.invoke('get-model'),
  saveModel: (model) => ipcRenderer.invoke('save-model', model),
  
  // === CATÉGORIES ===
  getCategories: () => ipcRenderer.invoke('get-categories'),
  saveCategories: (categories) => ipcRenderer.invoke('save-categories', categories),
  addCategory: (category) => ipcRenderer.invoke('add-category', category),
  deleteCategory: (categoryId) => ipcRenderer.invoke('delete-category', categoryId),
  updateCategory: (category) => ipcRenderer.invoke('update-category', category),
  
  // === HISTORIQUE & STATISTIQUES ===
  getErrorHistory: () => ipcRenderer.invoke('get-error-history'),
  addCorrection: (correction) => ipcRenderer.invoke('add-correction', correction),
  getStatistics: () => ipcRenderer.invoke('get-statistics'),
  
  // === DONNÉES ===
  resetData: (options) => ipcRenderer.invoke('reset-data', options),
  exportData: () => ipcRenderer.invoke('export-data'),
  
  // === UTILITAIRES ===
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // === ÉVÉNEMENTS ===
  onNavigateTo: (callback) => {
    const subscription = (event, page) => callback(page);
    ipcRenderer.on('navigate-to', subscription);
    return () => ipcRenderer.removeListener('navigate-to', subscription);
  },
  
  onConfigStatus: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('config-status', subscription);
    return () => ipcRenderer.removeListener('config-status', subscription);
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

console.log('[Preload] Orthographe Mistral API exposed');
