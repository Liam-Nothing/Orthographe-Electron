import { useState, useEffect } from 'react';
import { Download, X, RefreshCw, CheckCircle } from 'lucide-react';

function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, available, downloading, downloaded
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Écouter les événements de mise à jour
    window.electronAPI.onUpdateAvailable?.((data) => {
      setUpdateInfo(data);
      setStatus('available');
      setDismissed(false);
    });

    window.electronAPI.onDownloadProgress?.((percent) => {
      setStatus('downloading');
      setProgress(percent);
    });

    window.electronAPI.onUpdateDownloaded?.((data) => {
      setUpdateInfo(data);
      setStatus('downloaded');
    });
  }, []);

  const handleDownload = async () => {
    // Déclencher le téléchargement automatique
    // Note: autoUpdater.autoDownload est false, donc on doit le faire manuellement
    // Pour l'instant, on redirige vers la page de téléchargement
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal('https://github.com/Liam-Nothing/Orthographe-Electron/releases/latest');
    }
  };

  const handleInstall = () => {
    // Redémarrer pour installer
    // Note: nécessiterait un IPC handler pour quitAndInstall()
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal('https://github.com/Liam-Nothing/Orthographe-Electron/releases/latest');
    }
  };

  // Ne rien afficher si pas de mise à jour ou si fermé
  if (status === 'idle' || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
      <div className={`mx-auto max-w-4xl m-4 p-4 rounded-xl border shadow-lg backdrop-blur-sm ${
        status === 'downloaded' 
          ? 'bg-green-500/20 border-green-500/30' 
          : 'bg-purple-500/20 border-purple-500/30'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {status === 'downloading' ? (
              <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
            ) : status === 'downloaded' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Download className="w-5 h-5 text-purple-400" />
            )}
            
            <div>
              {status === 'available' && (
                <p className="text-white font-medium">
                  Nouvelle version disponible : <span className="text-purple-400">v{updateInfo?.version}</span>
                </p>
              )}
              {status === 'downloading' && (
                <p className="text-white font-medium">
                  Téléchargement en cours... {progress}%
                </p>
              )}
              {status === 'downloaded' && (
                <p className="text-white font-medium">
                  Mise à jour prête ! Redémarrez pour installer <span className="text-green-400">v{updateInfo?.version}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === 'available' && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Télécharger
              </button>
            )}
            
            {status === 'downloading' && (
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            
            {status === 'downloaded' && (
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Installer
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateNotification;

