const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// --- CONFIGURATION LOGS ---
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = false;
autoUpdater.requestHeaders = {};

let mainWindow;
let store;

// Defaults pour le store
const storeDefaults = {
  mistralApiKey: '',
  mistralModel: 'mistral-large-latest',
  isConfigured: false,
  categories: [
    {
      id: 'email',
      name: 'Email',
      icon: 'Mail',
      enabled: true,
      preprompt: "Tu es un assistant spécialisé dans la correction d'emails professionnels. Corrige l'orthographe, la grammaire et améliore la formulation pour un contexte professionnel. Assure-toi que le ton est approprié pour une communication par email."
    },
    {
      id: 'academic',
      name: 'Académique',
      icon: 'GraduationCap',
      enabled: true,
      preprompt: "Tu es un assistant spécialisé dans la correction de textes académiques. Corrige l'orthographe et la grammaire tout en maintenant un style académique formel. Vérifie la cohérence et la clarté des arguments."
    },
    {
      id: 'casual',
      name: 'Informel',
      icon: 'MessageCircle',
      enabled: true,
      preprompt: "Tu es un assistant pour la correction de textes informels (messages, réseaux sociaux, etc.). Corrige les fautes d'orthographe tout en préservant le ton décontracté et le style personnel de l'auteur."
    },
    {
      id: 'professional',
      name: 'Professionnel',
      icon: 'Briefcase',
      enabled: true,
      preprompt: "Tu es un assistant pour la correction de documents professionnels (rapports, présentations, etc.). Corrige l'orthographe et la grammaire, améliore la clarté et assure un ton professionnel approprié."
    }
  ],
  errorHistory: [],
  statistics: {
    totalCorrections: 0,
    totalErrors: 0,
    errorTypes: {}
  },
  draftText: '',
  draftResult: null
};

// --- INITIALISATION DU STORE (async pour ES module) ---
async function initStore() {
  const Store = (await import('electron-store')).default;
  store = new Store({
    name: 'orthographe-config',
    defaults: storeDefaults
  });
  return store;
}

// --- CRÉATION DU MENU ---
function createMenu() {
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Accueil',
          accelerator: 'Ctrl+H',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'home');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Pages',
      submenu: [
        {
          label: 'Correction',
          accelerator: 'Ctrl+1',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'home');
            }
          }
        },
        {
          label: 'Dashboard',
          accelerator: 'Ctrl+2',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'dashboard');
            }
          }
        },
        {
          label: 'Historique',
          accelerator: 'Ctrl+3',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'history');
            }
          }
        },
        {
          label: 'Catégories',
          accelerator: 'Ctrl+4',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'categories');
            }
          }
        },
        {
          label: 'Paramètres',
          accelerator: 'Ctrl+,',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'settings');
            }
          }
        }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        {
          label: 'Outils de développement',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          label: 'Recharger',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Plein écran',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        }
      ]
    },
    {
      label: '🔧 Debug',
      submenu: [
        {
          label: 'Ouvrir Debug',
          accelerator: 'Ctrl+D',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'debug');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Vérifier les mises à jour',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'debug');
            }
          }
        },
        {
          label: 'Voir les releases GitHub',
          click: () => {
            const { shell } = require('electron');
            shell.openExternal('https://github.com/Liam-Nothing/Orthographe-Electron/releases');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// --- CRÉATION DE LA FENÊTRE ---
function createWindow() {
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true, // Menu caché, appuyer sur Alt pour l'afficher
    show: false, // Ne pas afficher tant que pas prêt
    backgroundColor: '#0f172a', // Couleur de fond pendant le chargement
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Désactivé pour permettre electron-store
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    },
  });

  const forceProduction = process.env.NODE_ENV === 'production';

  if (isDev && !forceProduction) {
    log.info('Loading dev server at http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    
    // Toujours ouvrir DevTools en dev
    mainWindow.webContents.openDevTools();
    
    // Log des erreurs de chargement
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Failed to load:', errorCode, errorDescription);
    });
  } else {
    const distPath = path.join(__dirname, '../dist/index.html');
    log.info('Loading from dist:', distPath);
    mainWindow.loadFile(distPath);
  }

  // Afficher la fenêtre quand le contenu est chargé
  mainWindow.webContents.on('did-finish-load', () => {
    log.info('Content loaded successfully');
    mainWindow.show();
    
    // Envoyer l'état de configuration au renderer
    if (store) {
      mainWindow.webContents.send('config-status', {
        isConfigured: store.get('isConfigured'),
        version: app.getVersion()
      });
    }

    // Vérifier les mises à jour en production
    const isDev = !app.isPackaged;
    if (!isDev) {
      log.info('Checking for updates...');
      autoUpdater.checkForUpdates().catch(err => {
        log.error('Error checking for updates:', err);
      });
    }
  });

  // Log des erreurs de la console renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (level >= 2) { // Warnings et erreurs
      log.warn(`[Renderer] ${message}`);
    }
  });
}

// --- IPC HANDLERS ---
function setupIpcHandlers() {
  // Vérifier si l'app est configurée
  ipcMain.handle('check-config', async () => {
    return {
      isConfigured: store.get('isConfigured'),
      hasApiKey: !!store.get('mistralApiKey')
    };
  });

  // Sauvegarder la clé API
  ipcMain.handle('save-api-key', async (event, apiKey) => {
    try {
      store.set('mistralApiKey', apiKey);
      store.set('isConfigured', true);
      log.info('API key saved successfully');
      return { success: true };
    } catch (error) {
      log.error('Error saving API key:', error);
      return { success: false, error: error.message };
    }
  });

  // Récupérer la clé API
  ipcMain.handle('get-api-key', async () => {
    return store.get('mistralApiKey');
  });

  // Récupérer le modèle Mistral
  ipcMain.handle('get-model', async () => {
    return store.get('mistralModel');
  });

  // Sauvegarder le modèle
  ipcMain.handle('save-model', async (event, model) => {
    store.set('mistralModel', model);
    return { success: true };
  });

  // Récupérer les catégories
  ipcMain.handle('get-categories', async () => {
    return store.get('categories');
  });

  // Sauvegarder les catégories
  ipcMain.handle('save-categories', async (event, categories) => {
    store.set('categories', categories);
    return { success: true };
  });

  // Ajouter une catégorie
  ipcMain.handle('add-category', async (event, category) => {
    const categories = store.get('categories');
    categories.push(category);
    store.set('categories', categories);
    return { success: true, categories };
  });

  // Supprimer une catégorie
  ipcMain.handle('delete-category', async (event, categoryId) => {
    const categories = store.get('categories').filter(c => c.id !== categoryId);
    store.set('categories', categories);
    return { success: true, categories };
  });

  // Mettre à jour une catégorie
  ipcMain.handle('update-category', async (event, updatedCategory) => {
    const categories = store.get('categories').map(c => 
      c.id === updatedCategory.id ? updatedCategory : c
    );
    store.set('categories', categories);
    return { success: true, categories };
  });

  // Récupérer l'historique des erreurs
  ipcMain.handle('get-error-history', async () => {
    return store.get('errorHistory');
  });

  // Ajouter une correction à l'historique
  ipcMain.handle('add-correction', async (event, correction) => {
    const history = store.get('errorHistory');
    history.unshift(correction);
    
    if (history.length > 500) {
      history.pop();
    }
    
    store.set('errorHistory', history);
    
    const stats = store.get('statistics');
    stats.totalCorrections++;
    
    if (correction.mistakes && correction.mistakes.length > 0) {
      stats.totalErrors += correction.mistakes.length;
      
      correction.mistakes.forEach(mistake => {
        const type = mistake.type || 'autre';
        stats.errorTypes[type] = (stats.errorTypes[type] || 0) + 1;
      });
    }
    
    store.set('statistics', stats);
    
    return { success: true };
  });

  // Récupérer les statistiques
  ipcMain.handle('get-statistics', async () => {
    return store.get('statistics');
  });

  // Réinitialiser les données
  ipcMain.handle('reset-data', async (event, options = {}) => {
    if (options.history) {
      store.set('errorHistory', []);
    }
    if (options.statistics) {
      store.set('statistics', {
        totalCorrections: 0,
        totalErrors: 0,
        errorTypes: {}
      });
    }
    if (options.categories) {
      store.set('categories', storeDefaults.categories);
    }
    if (options.apiKey) {
      store.set('mistralApiKey', '');
      store.set('isConfigured', false);
    }
    return { success: true };
  });

  // Récupérer toutes les données pour export
  ipcMain.handle('export-data', async () => {
    return {
      errorHistory: store.get('errorHistory'),
      statistics: store.get('statistics'),
      categories: store.get('categories')
    };
  });

  // Ouvrir un lien dans le navigateur externe
  ipcMain.handle('open-external', async (event, url) => {
    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false, error: 'URL invalide' };
  });

  // Vérifier les mises à jour manuellement
  ipcMain.handle('check-for-updates', async () => {
    const isDev = !app.isPackaged;
    if (isDev) {
      log.info('Auto-update disabled in dev mode');
      return { success: false, error: 'Auto-update désactivé en mode développement' };
    }
    
    try {
      log.info('Manual update check triggered');
      await autoUpdater.checkForUpdates();
      return { success: true };
    } catch (error) {
      log.error('Error checking for updates:', error);
      return { success: false, error: error.message };
    }
  });

  // Récupérer les infos de l'application
  ipcMain.handle('get-app-info', async () => {
    return {
      version: app.getVersion(),
      isPackaged: app.isPackaged,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron
    };
  });

  // Récupérer les releases GitHub
  ipcMain.handle('get-github-releases', async () => {
    try {
      const https = require('https');
      
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.github.com',
          path: '/repos/Liam-Nothing/Orthographe-Electron/releases',
          method: 'GET',
          headers: {
            'User-Agent': 'Orthographe-Mistral-App'
          }
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const releases = JSON.parse(data);
              resolve(releases.slice(0, 10).map(r => ({
                version: r.tag_name,
                name: r.name,
                published: r.published_at,
                prerelease: r.prerelease,
                body: r.body,
                url: r.html_url
              })));
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.end();
      });
    } catch (error) {
      log.error('Error fetching releases:', error);
      return [];
    }
  });

  // Sauvegarder le brouillon
  ipcMain.handle('save-draft', async (event, text) => {
    store.set('draftText', text || '');
    return { success: true };
  });

  // Récupérer le brouillon
  ipcMain.handle('get-draft', async () => {
    return store.get('draftText') || '';
  });

  // Sauvegarder le résultat de correction
  ipcMain.handle('save-draft-result', async (event, result) => {
    store.set('draftResult', result);
    return { success: true };
  });

  // Récupérer le résultat de correction
  ipcMain.handle('get-draft-result', async () => {
    return store.get('draftResult');
  });
}

// --- APP LIFECYCLE ---
app.whenReady().then(async () => {
  // Initialiser le store avec import dynamique
  await initStore();
  
  // Setup IPC handlers après l'initialisation du store
  setupIpcHandlers();
  
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- AUTO UPDATE EVENTS ---
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
  if (mainWindow) {
    mainWindow.webContents.send('update-debug', {
      type: 'checking',
      message: 'Recherche de mises à jour...'
    });
  }
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update_available', {
      version: info.version,
      currentVersion: app.getVersion()
    });
  }
});

autoUpdater.on('update-not-available', () => {
  log.info('No update available');
});

autoUpdater.on('error', (err) => {
  log.error('Update error:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj.percent);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', percent);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update_downloaded', {
      version: info.version
    });
  }
});
