import { useState, useEffect } from 'react';
import { Bug, RefreshCw, Download, CheckCircle, AlertCircle, Info, Trash2, FolderOpen, Tag, ExternalLink, Clock } from 'lucide-react';

function Debug() {
  const [appInfo, setAppInfo] = useState({
    version: 'N/A',
    isPackaged: false,
    platform: 'N/A',
    arch: 'N/A',
    nodeVersion: 'N/A',
    electronVersion: 'N/A'
  });
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loadingReleases, setLoadingReleases] = useState(true);

  useEffect(() => {
    // Charger les infos au montage
    const initDebug = async () => {
      // Stats et données
      if (window.electronAPI) {
        const statistics = await window.electronAPI.getStatistics();
        setStats(statistics);

        const data = await window.electronAPI.exportData();
        setStoreData(data);

        const info = await window.electronAPI.getAppInfo();
        if (info) {
          setAppInfo(info);
        }

        // Releases
        try {
          const releasesData = await window.electronAPI.getGithubReleases();
          setReleases(releasesData || []);
        } catch (_err) {
          // Ignore
        }
        setLoadingReleases(false);

        addLog('info', 'Debug info loaded');
      } else {
        setAppInfo({
          version: '1.2.0',
          isPackaged: false,
          platform: navigator.platform,
          arch: 'unknown',
          nodeVersion: 'N/A',
          electronVersion: 'N/A'
        });
        setLoadingReleases(false);
      }
    };

    initDebug();

    // Setup listeners
    if (window.electronAPI) {
      window.electronAPI.onUpdateAvailable?.((data) => {
        setUpdateStatus('available');
        setUpdateInfo(data);
      });

      window.electronAPI.onUpdateDownloaded?.((data) => {
        setUpdateStatus('downloaded');
        setUpdateInfo(data);
      });

      window.electronAPI.onDownloadProgress?.((percent) => {
        setUpdateStatus('downloading');
        setDownloadProgress(percent);
      });
    }
  }, []);

  const loadReleases = async () => {
    setLoadingReleases(true);
    try {
      if (window.electronAPI?.getGithubReleases) {
        const data = await window.electronAPI.getGithubReleases();
        setReleases(data || []);
        addLog('info', `${data?.length || 0} releases chargées`);
      }
    } catch (_err) {
      addLog('error', 'Erreur chargement releases');
    }
    setLoadingReleases(false);
  };

  const reloadDebugInfo = async () => {
    if (window.electronAPI) {
      const statistics = await window.electronAPI.getStatistics();
      setStats(statistics);
      const data = await window.electronAPI.exportData();
      setStoreData(data);
    }
  };

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { type, message, timestamp }].slice(-50));
  };

  const checkForUpdates = async () => {
    setUpdateStatus('checking');
    addLog('info', 'Vérification des mises à jour...');
    
    if (window.electronAPI?.checkForUpdates) {
      try {
        const result = await window.electronAPI.checkForUpdates();
        if (!result.success) {
          addLog('warning', result.error || 'Échec de la vérification');
          setUpdateStatus('idle');
        }
      } catch (err) {
        setUpdateStatus('error');
        addLog('error', `Erreur: ${err.message}`);
      }
    } else {
      addLog('warning', 'checkForUpdates non disponible (mode dev?)');
      setUpdateStatus('idle');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs effacés');
  };

  const clearAllData = async () => {
    if (window.confirm('⚠️ Supprimer TOUTES les données (historique, stats, config) ?')) {
      if (window.electronAPI) {
        await window.electronAPI.resetData({ 
          history: true, 
          statistics: true, 
          categories: true 
        });
        addLog('success', 'Toutes les données ont été supprimées');
        reloadDebugInfo();
      }
    }
  };

  const openRelease = (url) => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    }
  };

  const getStatusIcon = () => {
    switch (updateStatus) {
      case 'checking':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />;
      case 'available':
        return <Download className="w-5 h-5 text-green-400" />;
      case 'downloading':
        return <Download className="w-5 h-5 animate-pulse text-yellow-400" />;
      case 'downloaded':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (updateStatus) {
      case 'checking':
        return 'Vérification en cours...';
      case 'available':
        return `Mise à jour disponible: v${updateInfo?.version}`;
      case 'downloading':
        return `Téléchargement: ${downloadProgress}%`;
      case 'downloaded':
        return `Prêt à installer: v${updateInfo?.version}`;
      case 'error':
        return 'Erreur de vérification';
      default:
        return 'Aucune vérification en cours';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-3 h-3 text-yellow-400" />;
      default:
        return <Info className="w-3 h-3 text-blue-400" />;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCurrentVersion = (version) => {
    const v = version.replace('v', '');
    return v === appInfo.version;
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Bug className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Debug & Diagnostics</h1>
            <p className="text-slate-400">Informations système, mises à jour et releases</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Info */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Informations Application
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Version</span>
              <span className="text-white font-mono bg-purple-500/20 px-2 py-0.5 rounded">v{appInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mode</span>
              <span className={`font-mono ${appInfo.isPackaged ? 'text-green-400' : 'text-yellow-400'}`}>
                {appInfo.isPackaged ? 'Production' : 'Développement'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Plateforme</span>
              <span className="text-white font-mono">{appInfo.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Architecture</span>
              <span className="text-white font-mono">{appInfo.arch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Node.js</span>
              <span className="text-white font-mono">{appInfo.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Electron</span>
              <span className="text-white font-mono">{appInfo.electronVersion}</span>
            </div>
          </div>
        </div>

        {/* Update Status */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-400" />
            Mises à jour
          </h2>
          
          <div className="mb-4 p-4 bg-slate-900/50 rounded-xl flex items-center gap-3">
            {getStatusIcon()}
            <span className="text-slate-300">{getStatusText()}</span>
          </div>

          {updateStatus === 'downloading' && (
            <div className="mb-4">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={checkForUpdates}
            disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
            className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {updateStatus === 'checking' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Vérifier les mises à jour
              </>
            )}
          </button>
        </div>

        {/* GitHub Releases */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-400" />
              Releases GitHub
            </h2>
            <button
              onClick={loadReleases}
              disabled={loadingReleases}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingReleases ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {loadingReleases ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : releases.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Aucune release trouvée</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {releases.map((release, i) => (
                <div 
                  key={i}
                  className={`p-4 rounded-xl border transition-colors ${
                    isCurrentVersion(release.version)
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-white">{release.version}</span>
                        {isCurrentVersion(release.version) && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                            Installée
                          </span>
                        )}
                        {release.prerelease && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                            Pre-release
                          </span>
                        )}
                        {i === 0 && !isCurrentVersion(release.version) && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            Dernière
                          </span>
                        )}
                      </div>
                      {release.name && release.name !== release.version && (
                        <p className="text-slate-300 text-sm mb-1">{release.name}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(release.published)}
                      </div>
                    </div>
                    <button
                      onClick={() => openRelease(release.url)}
                      className="p-2 text-slate-400 hover:text-purple-400 transition-colors"
                      title="Voir sur GitHub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-green-400" />
            Données stockées
          </h2>
          
          {stats && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Corrections totales</span>
                <span className="text-white font-mono">{stats.totalCorrections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Erreurs détectées</span>
                <span className="text-white font-mono">{stats.totalErrors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Items historique</span>
                <span className="text-white font-mono">{storeData?.errorHistory?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Catégories</span>
                <span className="text-white font-mono">{storeData?.categories?.length || 0}</span>
              </div>
            </div>
          )}

          <button
            onClick={clearAllData}
            className="w-full mt-4 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Réinitialiser les données
          </button>
        </div>

        {/* Logs */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bug className="w-5 h-5 text-orange-400" />
              Logs
            </h2>
            <button
              onClick={clearLogs}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Effacer
            </button>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-3 h-48 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-slate-500">Aucun log...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 py-1">
                  {getLogIcon(log.type)}
                  <span className="text-slate-500">{log.timestamp}</span>
                  <span className={`${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-slate-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Error Types */}
      {stats?.errorTypes && Object.keys(stats.errorTypes).length > 0 && (
        <div className="mt-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Répartition des erreurs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.errorTypes).map(([type, count]) => (
              <div key={type} className="bg-slate-900/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{count}</p>
                <p className="text-sm text-slate-400 capitalize">{type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Debug;
