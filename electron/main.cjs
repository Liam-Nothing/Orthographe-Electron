const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
require('dotenv').config();

// --- CONFIGURATION LOGS ---
// Les logs seront dans :
// Windows : %USERPROFILE%\AppData\Roaming\NomDeLApp\logs\
log.transports.file.level = 'info';
autoUpdater.logger = log;
// Désactiver le téléchargement automatique
autoUpdater.autoDownload = false;
// Forcer l'utilisation de l'API GitHub pour les repos privés
autoUpdater.requestHeaders = {};

// Configuration du feed URL pour electron-updater (sera configuré après le chargement de la config)

let mainWindow;
let appConfig = {};

// --- CHARGEMENT DE LA CONFIGURATION ---
function loadConfig() {
  const isDev = !app.isPackaged;
  
  // 1. Charger la config par défaut (toujours présente)
  // Utiliser app.getAppPath() qui fonctionne aussi bien en dev qu'en production (avec .asar)
  const appPath = app.getAppPath();
  const defaultConfigPath = path.join(appPath, 'config.default.json');
  
  log.info('App path:', appPath);
  log.info('Looking for config.default.json at:', defaultConfigPath);
  
  try {
    if (fs.existsSync(defaultConfigPath)) {
      const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
      appConfig = { ...defaultConfig };
      log.info('Default configuration loaded from:', defaultConfigPath);
    } else {
      log.warn('config.default.json not found at:', defaultConfigPath);
      appConfig = {
        TITLE: 'Electron Test App',
        API_URL: '',
        API_KEY: ''
      };
    }
  } catch (err) {
    log.error('Error loading config.default.json:', err);
    log.error('Attempted path:', defaultConfigPath);
    appConfig = {
      TITLE: 'Electron Test App',
      API_URL: '',
      API_KEY: ''
    };
  }
  
  // 2. En production, charger config.json depuis le dossier de l'app (si existe)
  if (!isDev) {
    const userConfigPath = path.join(path.dirname(app.getPath('exe')), 'config.json');
    try {
      if (fs.existsSync(userConfigPath)) {
        const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
        appConfig = { ...appConfig, ...userConfig };
        log.info('User configuration loaded from:', userConfigPath);
      }
    } catch (err) {
      log.warn('Error loading config.json:', err);
    }
  }
  
  // 3. En développement, le .env peut override (via process.env)
  // Les variables d'environnement ont la priorité la plus haute
  if (process.env.TITLE) appConfig.TITLE = process.env.TITLE;
  if (process.env.API_URL) appConfig.API_URL = process.env.API_URL;
  if (process.env.API_KEY) appConfig.API_KEY = process.env.API_KEY;
  if (process.env.GITHUB_TOKEN) appConfig.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  // Masquer les tokens dans les logs pour la sécurité
  const logConfig = { ...appConfig };
  if (logConfig.API_KEY) logConfig.API_KEY = '***';
  if (logConfig.GITHUB_TOKEN) logConfig.GITHUB_TOKEN = '***';
  
  // Dump complet pour debug
  log.info('=== CONFIGURATION DUMP ===');
  log.info('App path:', appPath);
  log.info('Is packaged:', !isDev);
  log.info('Final configuration:', logConfig);
  log.info('GITHUB_TOKEN present:', !!appConfig.GITHUB_TOKEN);
  log.info('GITHUB_TOKEN length:', appConfig.GITHUB_TOKEN ? appConfig.GITHUB_TOKEN.length : 0);
  log.info('GITHUB_TOKEN starts with:', appConfig.GITHUB_TOKEN ? appConfig.GITHUB_TOKEN.substring(0, 10) + '...' : 'N/A');
  log.info('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN ? '***' : undefined,
    GH_TOKEN: process.env.GH_TOKEN ? '***' : undefined
  });
  log.info('=== END CONFIGURATION DUMP ===');
  
  return appConfig;
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Home',
          accelerator: 'Ctrl+H',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'helloworld');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
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
          label: 'Hello World',
          accelerator: 'Ctrl+1',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'helloworld');
            }
          }
        },
        {
          label: 'Test Design',
          accelerator: 'Ctrl+3',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'testdesign');
            }
          }
        },
        {
          label: 'Debug',
          accelerator: 'Ctrl+2',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'debug');
            }
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Menu Bar',
          accelerator: 'Alt',
          click: () => {
            if (mainWindow) {
              const isMenuBarVisible = mainWindow.isMenuBarVisible();
              mainWindow.setMenuBarVisibility(!isMenuBarVisible);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          label: 'Reload',
          accelerator: 'Ctrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Full Screen',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true, // Cache la barre de menu par défaut
    webPreferences: {
      nodeIntegration: false,      // Désactivé pour la sécurité
      contextIsolation: true,       // Activé pour la sécurité
      sandbox: true,                // Sandbox activé pour la sécurité
      preload: path.join(__dirname, 'preload.cjs'), // Script de préchargement sécurisé
      devTools: isDev,             // DevTools uniquement en développement
      webSecurity: true,           // Sécurité web activée
      allowRunningInsecureContent: false // Bloquer le contenu non sécurisé
    },
  });

  // En développement, on attend que Vite lance le serveur (port 5173 par défaut)
  // En production, on charge le fichier index.html compilé
  const forceProduction = process.env.NODE_ENV === 'production';

  if (isDev && !forceProduction) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 'dist' est le dossier de sortie de Vite
    const distPath = path.join(__dirname, '../dist/index.html');
    log.info('Loading from dist:', distPath);
    mainWindow.loadFile(distPath);
    // En mode production local, on peut garder les DevTools pour debug
    // Décommentez la ligne suivante si vous voulez les DevTools en prod local
    // mainWindow.webContents.openDevTools();
  }

  // --- AUTO UPDATE CHECK ---
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    const currentVersion = app.getVersion();
    
    // Envoyer la configuration au renderer
    mainWindow.webContents.send('env-variables', {
      TITLE: appConfig.TITLE || 'Electron Test App',
      API_URL: appConfig.API_URL || '',
      API_KEY: appConfig.API_KEY || '',
      VERSION: currentVersion
    });
    
    // Configurer electron-updater pour les repositories GitHub
    if (!isDev) {
      // En production, charger package.json depuis le chemin de l'app
      const appPath = app.getAppPath();
      const packageJsonPath = path.join(appPath, 'package.json');
      const packageJson = require(packageJsonPath);
      const repoUrl = packageJson.repository.url;
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/);
      
      if (match) {
        const [, owner, repo] = match;
        
        // Si un token GitHub est disponible, le configurer AVANT setFeedURL
        const githubToken = process.env.GITHUB_TOKEN || appConfig.GITHUB_TOKEN || '';
        
        log.info('=== ELECTRON-UPDATER TOKEN CHECK ===');
        log.info('Token sources:', {
          fromEnv: !!process.env.GITHUB_TOKEN,
          fromConfig: !!appConfig.GITHUB_TOKEN,
          hasToken: !!githubToken,
          tokenLength: githubToken ? githubToken.length : 0,
          tokenPrefix: githubToken ? githubToken.substring(0, 15) + '...' : 'N/A'
        });
        log.info('App config keys:', Object.keys(appConfig));
        log.info('App config values (masked):', {
          TITLE: appConfig.TITLE,
          API_URL: appConfig.API_URL ? '***' : '',
          API_KEY: appConfig.API_KEY ? '***' : '',
          GITHUB_TOKEN: appConfig.GITHUB_TOKEN ? '***' : ''
        });
        log.info('Current process.env.GH_TOKEN:', process.env.GH_TOKEN ? '***' : 'NOT SET');
        log.info('=== END TOKEN CHECK ===');
        
        if (githubToken) {
          // electron-updater utilise GH_TOKEN comme variable d'environnement
          // IMPORTANT: Le token doit être défini AVANT setFeedURL
          process.env.GH_TOKEN = githubToken;
          
          // Configurer les headers pour forcer l'utilisation de l'API GitHub
          autoUpdater.requestHeaders = {
            'Authorization': `token ${githubToken}`,
            'User-Agent': 'Electron-App'
          };
          
          log.info('✅ GitHub token configured for electron-updater (GH_TOKEN set)');
          log.info('GH_TOKEN length after setting:', process.env.GH_TOKEN ? process.env.GH_TOKEN.length : 0);
          log.info('Request headers configured for API access');
        } else {
          log.error('❌ No GitHub token found!');
          log.error('Repository must be public or configure GITHUB_TOKEN in config.default.json');
          log.error('Config keys available:', Object.keys(appConfig));
          log.error('Config values:', JSON.stringify(appConfig, null, 2).replace(/GITHUB_TOKEN":\s*"[^"]+"/g, 'GITHUB_TOKEN": "***"'));
        }
        
        // Configurer le provider GitHub
        // Pour un repo privé, electron-updater doit utiliser l'API GitHub avec le token
        // Le token doit être défini AVANT setFeedURL
        const updateConfig = {
          provider: 'github',
          owner: owner,
          repo: repo
        };
        
        // Ajouter private: true seulement si un token est disponible
        if (githubToken) {
          updateConfig.private = true;
        }
        
        autoUpdater.setFeedURL(updateConfig);
        
        log.info('electron-updater configured:', {
          provider: 'github',
          owner: owner,
          repo: repo,
          private: !!updateConfig.private,
          hasToken: !!githubToken,
          tokenEnvVar: process.env.GH_TOKEN ? `SET (length: ${process.env.GH_TOKEN.length})` : 'NOT SET',
          requestHeaders: autoUpdater.requestHeaders ? 'CONFIGURED' : 'NOT SET'
        });
        
        // Vérifier que le token est bien dans l'environnement
        if (githubToken && !process.env.GH_TOKEN) {
          log.error('⚠️ WARNING: Token was set but GH_TOKEN env var is missing!');
          process.env.GH_TOKEN = githubToken;
        }
        
        const feedUrl = autoUpdater.getFeedURL();
        log.info('Feed URL (auto-generated):', feedUrl ? feedUrl.toString() : 'auto');
        
        // Envoyer les infos de debug
        mainWindow.webContents.send('update-debug', {
          type: 'init',
          message: 'Initializing update check',
          currentVersion: currentVersion,
          isDev: isDev,
          feedUrl: feedUrl ? feedUrl.toString() : 'auto',
          channel: autoUpdater.channel,
          owner: owner,
          repo: repo,
          hasToken: !!githubToken
        });
        
        log.info('=== STARTING UPDATE CHECK ===');
        log.info('Current version:', currentVersion);
        log.info('Repository:', `${owner}/${repo}`);
        log.info('Feed URL:', feedUrl ? feedUrl.toString() : 'auto');
        log.info('Token configured:', !!githubToken);
        log.info('GH_TOKEN env var:', process.env.GH_TOKEN ? `SET (length: ${process.env.GH_TOKEN.length})` : 'NOT SET');
        
        // Double vérification : s'assurer que le token est bien défini
        if (!process.env.GH_TOKEN && githubToken) {
          log.warn('⚠️ Token found but GH_TOKEN not set, setting it now...');
          process.env.GH_TOKEN = githubToken;
        }
        
        autoUpdater.checkForUpdates();
      } else {
        log.error('Unable to parse repository URL for electron-updater');
        mainWindow.webContents.send('update-debug', {
          type: 'error',
          message: 'Unable to configure electron-updater: invalid repository URL',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      mainWindow.webContents.send('update-debug', {
        type: 'info',
        message: 'Development mode: update check disabled'
      });
    }
  });
}

app.whenReady().then(() => {
  // Charger la configuration au démarrage
  loadConfig();
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

// --- ÉVÉNEMENTS AUTO-UPDATE ---
autoUpdater.on('checking-for-update', () => {
  const message = 'Checking for updates...';
  log.info('=== ' + message + ' ===');
  if (mainWindow) {
    mainWindow.webContents.send('update-debug', {
      type: 'checking',
      message: message,
      timestamp: new Date().toISOString()
    });
  }
});

autoUpdater.on('update-available', (info) => {
  const currentVersion = app.getVersion();
  const newVersion = info.version;
  const message = `Update available: ${newVersion} (current: ${currentVersion})`;
  
  log.info('=== ' + message + ' ===');
  log.info('Details:', JSON.stringify(info, null, 2));
  
  if (mainWindow) {
    mainWindow.webContents.send('update-debug', {
      type: 'available',
      message: message,
      currentVersion: currentVersion,
      newVersion: newVersion,
      info: info,
      timestamp: new Date().toISOString()
    });
    mainWindow.webContents.send('update_available', {
      version: newVersion,
      currentVersion: currentVersion
    });
  }
  
  // Demander à l'utilisateur s'il veut télécharger la mise à jour
  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Yes, update now', 'No, later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update Available',
      message: 'A new version is available. Do you want to download it now?',
      detail: `Current version: ${currentVersion}\nNew version: ${newVersion}`
    }).then(({ response }) => {
      if (response === 0) {
        log.info('✅ User accepted download');
        if (mainWindow) {
          mainWindow.webContents.send('update-debug', {
            type: 'download-start',
            message: 'Starting download...',
            timestamp: new Date().toISOString()
          });
        }
        autoUpdater.downloadUpdate();
      } else {
        log.info('❌ User declined download');
        if (mainWindow) {
          mainWindow.webContents.send('update-debug', {
            type: 'download-cancelled',
            message: 'Download cancelled by user',
            timestamp: new Date().toISOString()
          });
        }
      }
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  const currentVersion = app.getVersion();
  const message = `No update available. Current version: ${currentVersion}`;
  
  log.info('=== ' + message + ' ===');
  log.info('Info:', JSON.stringify(info, null, 2));
  
  if (mainWindow) {
    mainWindow.webContents.send('update-debug', {
      type: 'not-available',
      message: message,
      currentVersion: currentVersion,
      info: info,
      timestamp: new Date().toISOString()
    });
  }
});

autoUpdater.on('error', (err) => {
  const errorMessage = `Update error: ${err.message || err}`;
  log.error('=== AUTO-UPDATE ERROR ===');
  log.error('Full error:', err);
  log.error('Stack:', err.stack);
  
  if (mainWindow) {
    mainWindow.webContents.send('update-debug', {
      type: 'error',
      message: errorMessage,
      error: {
        message: err.message || String(err),
        code: err.code,
        stack: err.stack
      },
      timestamp: new Date().toISOString()
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj.percent);
  const log_message = `Download: ${percent}% - ${Math.round(progressObj.bytesPerSecond / 1024)} KB/s - ${Math.round(progressObj.transferred / 1024 / 1024)} MB / ${Math.round(progressObj.total / 1024 / 1024)} MB`;
  
  log.info(log_message);
  
  if (mainWindow) {
    mainWindow.webContents.send('update-debug', {
      type: 'download-progress',
      message: log_message,
      percent: percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total,
      timestamp: new Date().toISOString()
    });
    mainWindow.webContents.send('download-progress', percent);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  const message = `Update downloaded successfully: ${info.version}`;
  log.info('=== ' + message + ' ===');
  log.info('Details:', JSON.stringify(info, null, 2));
  
  if (mainWindow) {
    mainWindow.webContents.send('update-debug', {
      type: 'downloaded',
      message: message,
      info: info,
      timestamp: new Date().toISOString()
    });
    mainWindow.webContents.send('update_downloaded', {
      version: info.version
    });
  }
  
  // Demander à l'utilisateur s'il veut installer maintenant
  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Install and restart', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update Ready',
      message: 'The update has been downloaded. Do you want to install it now?',
      detail: `Version ${info.version}`
    }).then(({ response }) => {
      if (response === 0) {
        log.info('✅ Installing and restarting...');
        autoUpdater.quitAndInstall();
      } else {
        log.info('⏸️ Installation postponed');
      }
    });
  }
});

// Handler IPC pour récupérer les infos de debug
ipcMain.handle('get-debug-info', async () => {
  const isDev = !app.isPackaged;
  const appPath = app.getAppPath();
  
  return {
    appPath: appPath,
    isPackaged: !isDev,
    version: app.getVersion(),
    config: {
      ...appConfig,
      GITHUB_TOKEN: appConfig.GITHUB_TOKEN ? `***${appConfig.GITHUB_TOKEN.slice(-4)}` : undefined,
      API_KEY: appConfig.API_KEY ? '***' : undefined
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? '***' : undefined,
      GH_TOKEN: process.env.GH_TOKEN ? '***' : undefined
    },
    paths: {
      configDefault: path.join(appPath, 'config.default.json'),
      configUser: !isDev ? path.join(path.dirname(app.getPath('exe')), 'config.json') : 'N/A (dev mode)',
      packageJson: path.join(appPath, 'package.json')
    },
    filesExist: {
      configDefault: fs.existsSync(path.join(appPath, 'config.default.json')),
      configUser: !isDev ? fs.existsSync(path.join(path.dirname(app.getPath('exe')), 'config.json')) : false,
      packageJson: fs.existsSync(path.join(appPath, 'package.json'))
    }
  };
});

// Handler IPC pour récupérer les releases GitHub
ipcMain.handle('get-github-releases', async () => {
  try {
    const https = require('https');
    // Utiliser app.getAppPath() pour fonctionner aussi en production
    const appPath = app.getAppPath();
    const packageJsonPath = path.join(appPath, 'package.json');
    const packageJson = require(packageJsonPath);
    const repoUrl = packageJson.repository.url;
    // Parser l'URL en enlevant .git à la fin si présent
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/);
    
    if (!match) {
      log.error('Unable to parse repository URL:', repoUrl);
      return {
        error: 'Unable to parse repository URL',
        releases: []
      };
    }
    
    const [, owner, repo] = match;
    log.info(`Repository parsed: ${owner}/${repo}`);
    const url = `https://api.github.com/repos/${owner}/${repo}/releases`;
    
    // Récupérer le token GitHub depuis la config ou l'environnement
    const githubToken = process.env.GITHUB_TOKEN || appConfig.GITHUB_TOKEN || '';
    
    log.info('Fetching releases from:', url);
    if (githubToken) {
      log.info('GitHub token found (authentication enabled)');
    } else {
      log.warn('No GitHub token found - repository must be public or configure GITHUB_TOKEN');
    }
    
    const headers = {
      'User-Agent': 'Electron-App',
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // Ajouter le token d'authentification si disponible
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    return new Promise((resolve) => {
      https.get(url, { headers }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode === 401 || res.statusCode === 403) {
              const errorMsg = res.statusCode === 401 
                ? 'Authentication required (private repo?) - Configure GITHUB_TOKEN in .env or config.json'
                : 'Access denied (403) - Check GitHub token permissions';
              
              log.error(`HTTP error ${res.statusCode}: ${errorMsg}`);
              
              let errorDetails = {};
              try {
                errorDetails = JSON.parse(data);
              } catch (e) {
                errorDetails = { message: data };
              }
              
              resolve({
                error: errorMsg,
                statusCode: res.statusCode,
                details: errorDetails,
                releases: []
              });
              return;
            }
            
            if (res.statusCode === 404) {
              log.error(`Repository not found (404): ${owner}/${repo}`);
              resolve({
                error: `Repository not found: ${owner}/${repo}`,
                statusCode: 404,
                releases: []
              });
              return;
            }
            
            if (res.statusCode !== 200) {
              log.error(`HTTP error ${res.statusCode} while fetching releases:`, data);
              let errorDetails = {};
              try {
                errorDetails = JSON.parse(data);
              } catch (e) {
                errorDetails = { message: data };
              }
              
              resolve({
                error: `HTTP error ${res.statusCode}`,
                statusCode: res.statusCode,
                details: errorDetails,
                releases: []
              });
              return;
            }
            
            const releases = JSON.parse(data);
            
            // S'assurer que c'est un tableau
            if (Array.isArray(releases)) {
              log.info(`✅ Releases fetched: ${releases.length}`);
              resolve({
                error: null,
                releases: releases
              });
            } else {
              log.error('GitHub response is not an array:', typeof releases);
              resolve({
                error: 'Invalid response format',
                releases: []
              });
            }
          } catch (err) {
            log.error('Error parsing JSON:', err);
            resolve({
              error: `Parsing error: ${err.message}`,
              releases: []
            });
          }
        });
      }).on('error', (err) => {
        log.error('Network error while fetching releases:', err);
        resolve({
          error: `Network error: ${err.message}`,
          releases: []
        });
      });
    });
  } catch (error) {
    log.error('Error fetching releases:', error);
    return {
      error: error.message || 'Unknown error',
      releases: []
    };
  }
});

