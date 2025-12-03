import { useState, useEffect } from 'react';
import { Key, Save, AlertTriangle, CheckCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { validateApiKey } from '../services/mistral';

const MODELS = [
  { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Le plus puissant, meilleure compréhension' },
  { id: 'mistral-medium-latest', name: 'Mistral Medium', description: 'Équilibre performance/coût' },
  { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Rapide et économique' },
  { id: 'open-mistral-7b', name: 'Mistral 7B', description: 'Modèle open source' },
  { id: 'open-mixtral-8x7b', name: 'Mixtral 8x7B', description: 'Modèle open source avancé' }
];

function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('mistral-large-latest');
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalKey, setOriginalKey] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (window.electronAPI) {
      const [key, mdl] = await Promise.all([
        window.electronAPI.getApiKey(),
        window.electronAPI.getModel()
      ]);
      setApiKey(key || '');
      setOriginalKey(key || '');
      setModel(mdl || 'mistral-large-latest');
    }
  };

  const handleApiKeyChange = (value) => {
    setApiKey(value);
    setHasChanges(value !== originalKey);
    setMessage({ type: '', text: '' });
  };

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer une clé API' });
      return;
    }

    setIsValidating(true);
    setMessage({ type: '', text: '' });

    const result = await validateApiKey(apiKey.trim());

    setIsValidating(false);

    if (result.valid) {
      setMessage({ type: 'success', text: 'Clé API valide !' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (window.electronAPI) {
        await window.electronAPI.saveApiKey(apiKey.trim());
        await window.electronAPI.saveModel(model);
        setOriginalKey(apiKey.trim());
        setHasChanges(false);
        setMessage({ type: 'success', text: 'Paramètres enregistrés !' });
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }

    setIsSaving(false);
  };

  const handleResetAll = async () => {
    if (window.confirm('⚠️ Cette action va supprimer toutes vos données (historique, statistiques, catégories personnalisées) et réinitialiser la clé API.\n\nÊtes-vous sûr de vouloir continuer ?')) {
      if (window.electronAPI) {
        await window.electronAPI.resetData({
          history: true,
          statistics: true,
          categories: true,
          apiKey: true
        });
        setMessage({ type: 'success', text: 'Données réinitialisées. Rechargement...' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-2">Paramètres</h1>
        <p className="text-slate-400">Configurez votre clé API et vos préférences</p>
      </header>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl space-y-8">
          {/* API Key section */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Key className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Clé API Mistral</h2>
                <p className="text-sm text-slate-400">Votre clé d'accès à l'API Mistral</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Clé API
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Entrez votre clé API Mistral..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleValidate}
                  disabled={isValidating || !apiKey.trim()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-300 disabled:text-slate-600 rounded-xl transition-all flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Tester la clé
                </button>
              </div>

              {message.text && (
                <div className={`flex items-center gap-2 p-3 rounded-xl ${
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {message.text}
                </div>
              )}
            </div>
          </div>

          {/* Model selection */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">Modèle Mistral</h2>
            <div className="space-y-3">
              {MODELS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                    model === m.id
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'bg-slate-900/50 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={m.id}
                    checked={model === m.id}
                    onChange={(e) => {
                      setModel(e.target.value);
                      setHasChanges(true);
                    }}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    model === m.id
                      ? 'border-purple-400'
                      : 'border-slate-600'
                  }`}>
                    {model === m.id && (
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{m.name}</p>
                    <p className="text-sm text-slate-400">{m.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleResetAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Réinitialiser tout
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

