import { useState } from 'react';
import { Sparkles, Key, ArrowRight, Loader2, CheckCircle, AlertCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { validateApiKey } from '../services/mistral';
import Help from './Help';

function Setup({ onComplete }) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const openExternal = (url) => {
    if (window.electronAPI) {
      window.electronAPI.openExternal(url);
    }
  };

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setError('Veuillez entrer une clé API');
      return;
    }

    setIsValidating(true);
    setError('');

    const result = await validateApiKey(apiKey.trim());

    setIsValidating(false);

    if (result.valid) {
      setIsValid(true);
      setError('');
    } else {
      setError(result.error);
      setIsValid(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValid) {
      await handleValidate();
      return;
    }

    // Sauvegarder la clé
    if (window.electronAPI) {
      const result = await window.electronAPI.saveApiKey(apiKey.trim());
      if (result.success) {
        onComplete();
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    }
  };

  // Afficher la page d'aide
  if (showHelp) {
    return <Help onBack={() => setShowHelp(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl shadow-purple-500/30 mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Orthographe Mistral
          </h1>
          <p className="text-gray-400 text-lg">
            Correction intelligente propulsée par l'IA
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Configuration</h2>
              <p className="text-gray-400 text-sm">Entrez votre clé API Mistral</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clé API Mistral
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setIsValid(false);
                    setError('');
                  }}
                  placeholder="Entrez votre clé API..."
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    error 
                      ? 'border-red-500/50 focus:ring-red-500/50' 
                      : isValid 
                        ? 'border-green-500/50 focus:ring-green-500/50'
                        : 'border-white/10 focus:ring-purple-500/50'
                  }`}
                />
                {isValid && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                )}
              </div>
              
              {error && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {isValid && (
                <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Clé API validée avec succès !
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isValid && (
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={isValidating || !apiKey.trim()}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Validation...
                    </span>
                  ) : (
                    'Valider la clé'
                  )}
                </button>
              )}
              
              <button
                type="submit"
                disabled={!isValid}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isValid
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Commencer
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Help links */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <button
              onClick={() => setShowHelp(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              Comment obtenir une clé API ?
            </button>
            
            <button
              onClick={() => openExternal('https://console.mistral.ai/')}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir console.mistral.ai
            </button>
          </div>
        </div>

        {/* Features preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '📝', label: 'Correction IA' },
            { icon: '📊', label: 'Analytics' },
            { icon: '🎯', label: 'Catégories' }
          ].map((feature, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="text-xs text-gray-400">{feature.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Setup;
