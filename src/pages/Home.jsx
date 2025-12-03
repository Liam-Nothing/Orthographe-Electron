import { useState, useEffect } from 'react';
import { Send, Copy, CheckCircle, Loader2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import * as Icons from 'lucide-react';
import { correctText } from '../services/mistral';
import { v4 as uuidv4 } from 'uuid';

// Mapping des icônes
const getIcon = (iconName) => {
  return Icons[iconName] || Icons.FileText;
};

function Home() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('mistral-large-latest');

  useEffect(() => {
    const initData = async () => {
      if (window.electronAPI) {
        const [cats, key, mdl, draft, draftResult] = await Promise.all([
          window.electronAPI.getCategories(),
          window.electronAPI.getApiKey(),
          window.electronAPI.getModel(),
          window.electronAPI.getDraft(),
          window.electronAPI.getDraftResult()
        ]);
        setCategories(cats.filter(c => c.enabled));
        setApiKey(key);
        setModel(mdl);
        
        // Charger le brouillon sauvegardé
        if (draft) {
          setText(draft);
        }
        
        // Charger le résultat sauvegardé
        if (draftResult) {
          setResult(draftResult);
        }
        
        // Sélectionner la première catégorie par défaut
        const enabledCats = cats.filter(c => c.enabled);
        if (enabledCats.length > 0) {
          setSelectedCategory(enabledCats[0]);
        }
      }
    };
    initData();
  }, []);

  // Sauvegarder le brouillon quand le texte change
  const handleTextChange = (newText) => {
    setText(newText);
    if (window.electronAPI) {
      window.electronAPI.saveDraft(newText);
    }
  };

  const handleCorrect = async () => {
    if (!text.trim()) {
      setError('Veuillez entrer un texte à corriger');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const correctionResult = await correctText(text, selectedCategory, apiKey, model);
      setResult(correctionResult);

      // Sauvegarder le résultat pour persistance
      if (window.electronAPI) {
        window.electronAPI.saveDraftResult(correctionResult);
      }

      // Sauvegarder dans l'historique
      if (window.electronAPI && correctionResult.mistakes.length > 0) {
        await window.electronAPI.addCorrection({
          id: uuidv4(),
          date: new Date().toISOString(),
          category: selectedCategory?.id || 'general',
          categoryName: selectedCategory?.name || 'Général',
          original: text,
          corrected: correctionResult.correctedText,
          mistakes: correctionResult.mistakes,
          summary: correctionResult.summary
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.correctedText) {
      await navigator.clipboard.writeText(result.correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setText('');
    setResult(null);
    setError('');
    if (window.electronAPI) {
      window.electronAPI.saveDraft('');
      window.electronAPI.saveDraftResult(null);
    }
  };

  const getMistakeTypeColor = (type) => {
    const colors = {
      orthographe: 'bg-red-500/20 text-red-400 border-red-500/30',
      grammaire: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      conjugaison: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      syntaxe: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      ponctuation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      accord: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      style: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };
    return colors[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-2">Correction de texte</h1>
        <p className="text-slate-400">Sélectionnez une catégorie et entrez votre texte</p>
      </header>

      {/* Categories */}
      <div className="px-8 py-4 border-b border-slate-800">
        <div className="flex gap-3 flex-wrap">
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            const isSelected = selectedCategory?.id === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-2 gap-6 min-h-full">
          {/* Input section */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-400 mb-2">
              Texte à corriger
            </label>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Collez ou tapez votre texte ici..."
              className="min-h-[200px] w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-y focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCorrect}
                disabled={isLoading || !text.trim()}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Correction en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Corriger
                  </>
                )}
              </button>
              
              {(text || result) && (
                <button
                  onClick={handleReset}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Output section */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-400 mb-2">
              Texte corrigé
            </label>
            
            {result ? (
              <div className="flex flex-col gap-4">
                {/* Corrected text */}
                <div className="relative p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-all"
                    title="Copier le texte"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <p className="text-white whitespace-pre-wrap pr-12">{result.correctedText}</p>
                </div>

                {/* Mistakes list */}
                {result.mistakes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {result.mistakes.length} faute{result.mistakes.length > 1 ? 's' : ''} détectée{result.mistakes.length > 1 ? 's' : ''}
                    </h3>
                    
                    <div className="space-y-3">
                      {result.mistakes.map((mistake, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl"
                        >
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getMistakeTypeColor(mistake.type)}`}>
                              {mistake.type}
                            </span>
                            <span className="text-slate-500">→</span>
                            <span className="text-red-400 line-through">{mistake.original}</span>
                            <span className="text-slate-500">→</span>
                            <span className="text-green-400 font-medium">{mistake.correction}</span>
                          </div>
                          <p className="text-sm text-slate-400">{mistake.explanation}</p>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    {result.summary && (
                      <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <h4 className="text-sm font-medium text-purple-400 mb-1">Résumé</h4>
                        <p className="text-sm text-slate-300">{result.summary}</p>
                      </div>
                    )}
                  </div>
                )}

                {result.mistakes.length === 0 && (
                  <div className="py-12 flex items-center justify-center">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <p className="text-slate-300 font-medium">Aucune faute détectée !</p>
                      <p className="text-sm text-slate-500 mt-1">Votre texte semble correct</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="min-h-[200px] flex items-center justify-center bg-slate-800/30 border border-slate-700/50 rounded-xl border-dashed">
                <div className="text-center text-slate-500">
                  <Send className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>Le texte corrigé apparaîtra ici</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

