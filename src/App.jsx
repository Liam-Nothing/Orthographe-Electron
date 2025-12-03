import { useState, useEffect } from 'react'
import HelloWorld from './HelloWorld'
import DebugPage from './DebugPage'
import TestDesign from './TestDesign'
import LoadingOverlay from './LoadingOverlay'

function App() {
  const [currentPage, setCurrentPage] = useState('helloworld') // 'helloworld', 'debug'
  // Message pour les mises à jour futures
  const [_message, _setMessage] = useState('Update successful! 🎉 (v1.0.2)')
  const [updateStatus, setUpdateStatus] = useState('')
  const [appTitle, setAppTitle] = useState('Electron Test App')
  const [appVersion, setAppVersion] = useState('1.0.0')
  const [debugLogs, setDebugLogs] = useState([])
  const [githubReleases, setGithubReleases] = useState([])
  const [downloadProgress, setDownloadProgress] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')

  // Fonction pour comparer les versions
  const compareVersions = (v1, v2) => {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0
      if (part1 > part2) return 1
      if (part1 < part2) return -1
    }
    return 0
  }

  useEffect(() => {
    // En mode développement avec Vite, utiliser import.meta.env
    // En production avec Electron, utiliser IPC via l'API sécurisée
    if (import.meta.env.VITE_TITLE) {
      setAppTitle(import.meta.env.VITE_TITLE)
    }
    if (import.meta.env.VITE_VERSION) {
      setAppVersion(import.meta.env.VITE_VERSION)
    }
    
    // Tableau pour stocker les fonctions de cleanup
    const cleanupFunctions = []
    
    // Écoute des événements via l'API Electron sécurisée (preload.js)
    if (window.electronAPI) {
      // Recevoir les variables d'environnement (pour la version packagée)
      const cleanupEnv = window.electronAPI.onEnvVariables((env) => {
        if (env.TITLE) {
          setAppTitle(env.TITLE)
        }
        if (env.VERSION) {
          setAppVersion(env.VERSION)
        }
      })
      cleanupFunctions.push(cleanupEnv)
      
      // Écouter les logs de debug
      const cleanupDebug = window.electronAPI.onUpdateDebug((data) => {
        setDebugLogs(prev => [...prev, data].slice(-50)) // Garder les 50 derniers logs
        console.log('[UPDATE DEBUG]', data)
        
        // Masquer l'overlay en cas d'erreur
        if (data.type === 'error') {
          setIsLoading(false)
          setLoadingMessage('Loading...')
        }
        
        // Masquer l'overlay si le téléchargement est annulé
        if (data.type === 'download-cancelled') {
          setIsLoading(false)
          setLoadingMessage('Loading...')
        }
      })
      cleanupFunctions.push(cleanupDebug)
      
      const cleanupAvailable = window.electronAPI.onUpdateAvailable((data) => {
        const msg = data ? `Update available! Version ${data.newVersion} (current: ${data.currentVersion})` : 'Update available!'
        setUpdateStatus(msg)
        setIsLoading(true)
        setLoadingMessage('Preparing download...')
      })
      cleanupFunctions.push(cleanupAvailable)
      
      const cleanupDownloaded = window.electronAPI.onUpdateDownloaded((data) => {
        const msg = data ? `Update ${data.version} downloaded. It will be installed on restart.` : 'Update downloaded. It will be installed on restart.'
        setUpdateStatus(msg)
        setDownloadProgress(null)
        setIsLoading(false)
        setLoadingMessage('Loading...')
      })
      cleanupFunctions.push(cleanupDownloaded)
      
      const cleanupProgress = window.electronAPI.onDownloadProgress((percent) => {
        setDownloadProgress(percent)
        setIsLoading(true)
        setLoadingMessage(`Downloading update... ${percent}%`)
      })
      cleanupFunctions.push(cleanupProgress)
      
      // Écouter les changements de page depuis le menu
      const cleanupNav = window.electronAPI.onNavigateTo((page) => {
        setCurrentPage(page)
      })
      cleanupFunctions.push(cleanupNav)
      
      // Récupérer les infos de debug
      window.electronAPI.getDebugInfo()
        .then(info => {
          setDebugInfo(info)
          console.log('[DEBUG INFO]', info)
        })
        .catch(err => {
          console.error('Error fetching debug info:', err)
        })
      
      // Récupérer les releases GitHub
      window.electronAPI.getGitHubReleases()
        .then(result => {
          // Le handler retourne maintenant un objet { error, releases }
          if (result && result.releases) {
            if (Array.isArray(result.releases)) {
              setGithubReleases(result.releases)
              
              // Si il y a une erreur, l'afficher dans les logs
              if (result.error) {
                setDebugLogs(prev => [...prev, {
                  type: 'error',
                  message: `GitHub API error: ${result.error}`,
                  details: result.details,
                  statusCode: result.statusCode,
                  timestamp: new Date().toISOString()
                }])
              }
            } else {
              setGithubReleases([])
              setDebugLogs(prev => [...prev, {
                type: 'error',
                message: `Invalid GitHub response format: ${typeof result.releases}`,
                timestamp: new Date().toISOString()
              }])
            }
          } else {
            // Ancien format (rétrocompatibilité)
            if (Array.isArray(result)) {
              setGithubReleases(result)
            } else {
              setGithubReleases([])
              setDebugLogs(prev => [...prev, {
                type: 'error',
                message: `Unexpected response format: ${typeof result}`,
                timestamp: new Date().toISOString()
              }])
            }
          }
        })
        .catch(err => {
          console.error('Error fetching releases:', err)
          setGithubReleases([])
          setDebugLogs(prev => [...prev, {
            type: 'error',
            message: `GitHub API error: ${err.message || String(err)}`,
            timestamp: new Date().toISOString()
          }])
        })
    }
    
    // Écouter les événements personnalisés pour la navigation
    const handleNavigation = (event) => {
      setCurrentPage(event.detail.page)
    }
    window.addEventListener('navigate-to', handleNavigation)
    
    return () => {
      window.removeEventListener('navigate-to', handleNavigation)
      // Nettoyer les écouteurs Electron
      cleanupFunctions.forEach(cleanup => cleanup && cleanup())
    }
  }, [])

  // Trier toutes les releases (plus récentes en premier)
  const allReleases = Array.isArray(githubReleases) 
    ? githubReleases
        .filter(release => release && release.tag_name)
        .sort((a, b) => {
          try {
            const v1 = a.tag_name.replace(/^v/, '')
            const v2 = b.tag_name.replace(/^v/, '')
            return compareVersions(v2, v1) // Plus récent en premier
          } catch (err) {
            console.error('Error sorting:', err)
            return 0
          }
        })
    : []
  
  // Filtrer les releases plus récentes que la version actuelle
  const _newerReleases = allReleases.filter(release => {
    try {
      const releaseVersion = release.tag_name.replace(/^v/, '')
      return compareVersions(releaseVersion, appVersion) > 0
    } catch {
      return false
    }
  })

  // Navigation entre les pages
  if (currentPage === 'debug') {
    return (
      <>
        <DebugPage 
          appTitle={appTitle}
          appVersion={appVersion}
          updateStatus={updateStatus}
          downloadProgress={downloadProgress}
          githubReleases={githubReleases}
          debugLogs={debugLogs}
          debugInfo={debugInfo}
          compareVersions={compareVersions}
          setDebugLogs={setDebugLogs}
          setIsLoading={setIsLoading}
          setLoadingMessage={setLoadingMessage}
        />
        <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
      </>
    )
  }

  if (currentPage === 'testdesign') {
    return (
      <>
        <TestDesign 
          setIsLoading={setIsLoading}
          setLoadingMessage={setLoadingMessage}
        />
        <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
      </>
    )
  }

  // Page principale : Hello World
  return (
    <>
      <HelloWorld />
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </>
  )
}

export default App


