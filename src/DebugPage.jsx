import { useState, useEffect } from 'react'

function DebugPage({ 
  appTitle: _appTitle, 
  appVersion, 
  updateStatus, 
  downloadProgress, 
  githubReleases, 
  debugLogs, 
  debugInfo, 
  compareVersions,
  setDebugLogs 
}) {
  const [loading, setLoading] = useState(true)
  const [localDebugInfo, setLocalDebugInfo] = useState(debugInfo)

  useEffect(() => {
    if (window.electronAPI && !localDebugInfo) {
      window.electronAPI.getDebugInfo()
        .then(info => {
          setLocalDebugInfo(info)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching debug info:', error)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [localDebugInfo])

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate-to', { detail: { page: 'helloworld' } }))
  }

  // Trier toutes les releases (plus récentes en premier)
  const allReleases = Array.isArray(githubReleases) 
    ? githubReleases
        .filter(release => release && release.tag_name)
        .sort((a, b) => {
          try {
            const v1 = a.tag_name.replace(/^v/, '')
            const v2 = b.tag_name.replace(/^v/, '')
            return compareVersions(v2, v1) // Plus récent en premier
          } catch {
            return 0
          }
        })
    : []
  
  // Filtrer les releases plus récentes que la version actuelle
  const newerReleases = allReleases.filter(release => {
    try {
      const releaseVersion = release.tag_name.replace(/^v/, '')
      return compareVersions(releaseVersion, appVersion) > 0
    } catch {
      return false
    }
  })

  const infoToDisplay = localDebugInfo || debugInfo

  if (loading && !infoToDisplay) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Loading debug information...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>🔧 Debug Information</h1>
        <button
          onClick={handleBack}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          ← Back to Home
        </button>
      </div>

      {/* Version Information */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20,
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ marginTop: 0 }}>📦 Version Information</h2>
        <p><strong>Current version:</strong> <span style={{ color: '#007bff', fontSize: '1.2em' }}>{appVersion}</span></p>
        
        {updateStatus && (
          <div style={{ 
            background: updateStatus.includes('available') ? '#fff3cd' : '#d4edda', 
            padding: 10, 
            borderRadius: 5, 
            marginTop: 10,
            border: `1px solid ${updateStatus.includes('available') ? '#ffc107' : '#28a745'}`
          }}>
            {updateStatus.includes('available') ? '⚠️' : '✅'} {updateStatus}
          </div>
        )}
        
        {downloadProgress !== null && (
          <div style={{ marginTop: 10 }}>
            <p><strong>Download:</strong> {downloadProgress}%</p>
            <div style={{ 
              width: '100%', 
              height: 20, 
              background: '#e9ecef', 
              borderRadius: 10,
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${downloadProgress}%`, 
                height: '100%', 
                background: '#007bff',
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
        )}
      </div>

      {/* GitHub Releases */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20,
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ marginTop: 0 }}>🚀 Available Releases</h2>
        {!Array.isArray(githubReleases) ? (
          <div>
            <p style={{ color: '#dc3545' }}>❌ Error: Unable to load GitHub releases</p>
            <p style={{ color: '#6c757d', fontSize: '0.9em', marginTop: 10 }}>
              💡 <strong>If your repo is private:</strong> Add <code>GITHUB_TOKEN</code> to your <code>.env</code> or <code>config.json</code> file
            </p>
            <p style={{ color: '#6c757d', fontSize: '0.85em', marginTop: 5 }}>
              To create a token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate with <code>repo</code> permission
            </p>
          </div>
        ) : githubReleases.length === 0 ? (
          <div>
            <p style={{ color: '#6c757d' }}>Loading releases...</p>
            <p style={{ color: '#ffc107', fontSize: '0.9em', marginTop: 10 }}>
              ⚠️ If loading is stuck, check the debug logs below. The repo might be private and require a GitHub token.
            </p>
          </div>
        ) : allReleases.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No releases available.</p>
        ) : (
          <div>
            {newerReleases.length > 0 && (
              <p style={{ color: '#ffc107', marginBottom: 10 }}>
                ⚠️ {newerReleases.length} newer version(s) available!
              </p>
            )}
            {newerReleases.length === 0 && (
              <p style={{ color: '#28a745', marginBottom: 10 }}>
                ✅ You are up to date! No newer version available.
              </p>
            )}
            <p style={{ color: '#6c757d', fontSize: '0.9em', marginBottom: 10 }}>
              List of all releases ({allReleases.length}):
            </p>
            <ul style={{ textAlign: 'left', maxHeight: 300, overflowY: 'auto' }}>
              {allReleases.map((release, index) => {
                const releaseVersion = release.tag_name.replace(/^v/, '')
                const isNewer = compareVersions(releaseVersion, appVersion) > 0
                const isCurrent = releaseVersion === appVersion
                return (
                  <li key={index} style={{ 
                    marginBottom: 10, 
                    padding: 10, 
                    background: isCurrent ? '#e7f3ff' : 'white', 
                    borderRadius: 5,
                    border: isCurrent ? '2px solid #007bff' : '1px solid #dee2e6'
                  }}>
                    <strong style={{ color: isNewer ? '#dc3545' : isCurrent ? '#007bff' : '#6c757d', fontSize: '1.1em' }}>
                      {release.tag_name}
                    </strong>
                    {isNewer && <span style={{ color: '#dc3545', marginLeft: 10, fontWeight: 'bold' }}>← NEW VERSION</span>}
                    {isCurrent && <span style={{ color: '#007bff', marginLeft: 10, fontWeight: 'bold' }}>← CURRENT VERSION</span>}
                    <br />
                    <small style={{ color: '#6c757d' }}>
                      Published on: {new Date(release.published_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                    {release.name && release.name !== release.tag_name && (
                      <p style={{ marginTop: 5, fontWeight: 'bold' }}>{release.name}</p>
                    )}
                    {release.body && (
                      <p style={{ marginTop: 5, fontSize: '0.9em', color: '#495057' }}>
                        {release.body.substring(0, 150)}{release.body.length > 150 ? '...' : ''}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Application Info */}
      {infoToDisplay && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: 15, 
          borderRadius: 8, 
          marginBottom: 20,
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ marginTop: 0 }}>📱 Application Information</h2>
          <div style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: 15, 
            borderRadius: 5, 
            fontFamily: 'monospace',
            fontSize: '0.9em'
          }}>
            <div><strong>App Path:</strong> {infoToDisplay.appPath}</div>
            <div><strong>Is Packaged:</strong> {infoToDisplay.isPackaged ? 'Yes' : 'No'}</div>
            <div><strong>Version:</strong> {infoToDisplay.version}</div>
          </div>
        </div>
      )}

      {/* Configuration */}
      {infoToDisplay && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: 15, 
          borderRadius: 8, 
          marginBottom: 20,
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ marginTop: 0 }}>⚙️ Configuration</h2>
          <div style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: 15, 
            borderRadius: 5, 
            fontFamily: 'monospace',
            fontSize: '0.9em',
            overflowX: 'auto'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(infoToDisplay.config, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Environment Variables */}
      {infoToDisplay && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: 15, 
          borderRadius: 8, 
          marginBottom: 20,
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ marginTop: 0 }}>🌍 Environment Variables</h2>
          <div style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: 15, 
            borderRadius: 5, 
            fontFamily: 'monospace',
            fontSize: '0.9em',
            overflowX: 'auto'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(infoToDisplay.env, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* File Paths */}
      {infoToDisplay && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: 15, 
          borderRadius: 8, 
          marginBottom: 20,
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ marginTop: 0 }}>📁 File Paths</h2>
          <div style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: 15, 
            borderRadius: 5, 
            fontFamily: 'monospace',
            fontSize: '0.9em',
            overflowX: 'auto'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(infoToDisplay.paths, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Files Exist */}
      {infoToDisplay && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: 15, 
          borderRadius: 8, 
          marginBottom: 20,
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ marginTop: 0 }}>✅ Files Existence</h2>
          <div style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: 15, 
            borderRadius: 5, 
            fontFamily: 'monospace',
            fontSize: '0.9em',
            overflowX: 'auto'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(infoToDisplay.filesExist, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Debug Logs */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: 15, 
        borderRadius: 8,
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ marginTop: 0 }}>🔍 Debug Logs (Auto Update)</h2>
        <div style={{ 
          background: '#1e1e1e', 
          color: '#d4d4d4', 
          padding: 15, 
          borderRadius: 5, 
          maxHeight: 400, 
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85em',
          textAlign: 'left'
        }}>
          {debugLogs.length === 0 ? (
            <p style={{ color: '#6c757d' }}>Waiting for logs...</p>
          ) : (
            debugLogs.map((log, index) => {
              const colors = {
                'init': '#4fc3f7',
                'checking': '#ffa726',
                'available': '#66bb6a',
                'not-available': '#78909c',
                'error': '#ef5350',
                'download-start': '#42a5f5',
                'download-progress': '#42a5f5',
                'download-cancelled': '#ffa726',
                'downloaded': '#66bb6a',
                'info': '#90caf9'
              }
              const color = colors[log.type] || '#d4d4d4'
              return (
                <div key={index} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #333' }}>
                  <span style={{ color: '#78909c' }}>
                    [{new Date(log.timestamp).toLocaleTimeString('en-US')}]
                  </span>
                  <span style={{ color, marginLeft: 10, fontWeight: 'bold' }}>
                    [{log.type?.toUpperCase()}]
                  </span>
                  <span style={{ marginLeft: 10 }}>{log.message}</span>
                  {log.currentVersion && (
                    <div style={{ marginLeft: 30, marginTop: 5, color: '#90caf9' }}>
                      Current version: {log.currentVersion}
                    </div>
                  )}
                  {log.newVersion && (
                    <div style={{ marginLeft: 30, marginTop: 5, color: '#66bb6a' }}>
                      New version: {log.newVersion}
                    </div>
                  )}
                  {log.error && (
                    <div style={{ marginLeft: 30, marginTop: 5, color: '#ef5350' }}>
                      Error: {log.error.message}
                    </div>
                  )}
                  {log.percent !== undefined && (
                    <div style={{ marginLeft: 30, marginTop: 5, color: '#42a5f5' }}>
                      Progress: {log.percent}%
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
        {debugLogs.length > 0 && setDebugLogs && (
          <button 
            onClick={() => setDebugLogs([])}
            style={{
              marginTop: 10,
              padding: '5px 15px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            Clear logs
          </button>
        )}
      </div>
    </div>
  )
}

export default DebugPage
