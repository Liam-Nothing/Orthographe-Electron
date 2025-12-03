import { useState, useEffect } from 'react';
import { Clock, Search, ChevronDown, ChevronUp, AlertCircle, CheckCircle, BookOpen, Lightbulb, Calendar } from 'lucide-react';

function History() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Appliquer les filtres quand les dépendances changent
    let filtered = [...history];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.original?.toLowerCase().includes(term) ||
        item.corrected?.toLowerCase().includes(term) ||
        item.mistakes?.some(m => 
          m.original?.toLowerCase().includes(term) ||
          m.correction?.toLowerCase().includes(term) ||
          m.explanation?.toLowerCase().includes(term)
        )
      );
    }

    // Filtre par type de faute
    if (filterType !== 'all') {
      filtered = filtered.filter(item =>
        item.mistakes?.some(m => m.type === filterType)
      );
    }

    // Filtre par catégorie
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, filterType, filterCategory]);

  const loadData = async () => {
    if (window.electronAPI) {
      const [hist, cats] = await Promise.all([
        window.electronAPI.getErrorHistory(),
        window.electronAPI.getCategories()
      ]);
      setHistory(hist || []);
      setCategories(cats || []);
    }
    setIsLoading(false);
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extraire tous les types de fautes uniques
  const allMistakeTypes = [...new Set(
    history.flatMap(item => item.mistakes?.map(m => m.type) || [])
  )].filter(Boolean);

  // Calculer les conseils basés sur les fautes récurrentes
  const getPersonalizedTips = () => {
    const mistakeCounts = {};
    history.forEach(item => {
      item.mistakes?.forEach(m => {
        const type = m.type || 'autre';
        mistakeCounts[type] = (mistakeCounts[type] || 0) + 1;
      });
    });

    const sortedTypes = Object.entries(mistakeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const tips = {
      orthographe: "📚 Relisez vos textes à voix haute pour détecter les fautes d'orthographe. Utilisez un dictionnaire en cas de doute.",
      grammaire: "📖 Révisez les règles de grammaire de base, notamment l'accord sujet-verbe et les compléments.",
      conjugaison: "⏰ Concentrez-vous sur les temps verbaux les plus utilisés : présent, passé composé, imparfait et futur.",
      accord: "🎯 Identifiez toujours le sujet avant d'accorder le verbe. Attention aux sujets inversés ou éloignés.",
      ponctuation: "✍️ La virgule sépare les éléments d'une énumération et encadre les propositions incises.",
      syntaxe: "🔄 Variez la structure de vos phrases et évitez les répétitions.",
      style: "💡 Privilégiez les phrases courtes et directes pour plus de clarté."
    };

    return sortedTypes.map(([type, count]) => ({
      type,
      count,
      tip: tips[type] || "Continuez à pratiquer pour vous améliorer !"
    }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const personalizedTips = getPersonalizedTips();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-2">Historique des corrections</h1>
        <p className="text-slate-400">Consultez toutes vos corrections passées en détail</p>
      </header>

      {/* Filters & Search */}
      <div className="px-8 py-4 border-b border-slate-800 space-y-4">
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher dans l'historique..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Filter by type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">Tous les types</option>
            {allMistakeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Filter by category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <span className="text-slate-400">
            <strong className="text-white">{filteredHistory.length}</strong> correction{filteredHistory.length > 1 ? 's' : ''}
          </span>
          <span className="text-slate-400">
            <strong className="text-white">{filteredHistory.reduce((acc, item) => acc + (item.mistakes?.length || 0), 0)}</strong> fautes au total
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Personalized Tips */}
          {personalizedTips.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Conseils personnalisés</h2>
              </div>
              <div className="space-y-3">
                {personalizedTips.map(({ type, count, tip }) => (
                  <div key={type} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getMistakeTypeColor(type)} capitalize`}>
                      {type} ({count}x)
                    </span>
                    <p className="text-sm text-slate-300 flex-1">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History List */}
          {filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((item) => {
                const isExpanded = expandedItems[item.id];
                
                return (
                  <div
                    key={item.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-800/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(item.date)}
                        </div>
                        <span className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-lg">
                          {item.categoryName || 'Général'}
                        </span>
                        <span className="text-slate-400 truncate flex-1">
                          {item.original?.substring(0, 60)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-sm">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">{item.mistakes?.length || 0} faute{(item.mistakes?.length || 0) > 1 ? 's' : ''}</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-slate-700 p-6 space-y-6">
                        {/* Original vs Corrected */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-400" />
                              Texte original
                            </h4>
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                              <p className="text-slate-300 whitespace-pre-wrap text-sm">{item.original}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              Texte corrigé
                            </h4>
                            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                              <p className="text-slate-300 whitespace-pre-wrap text-sm">{item.corrected}</p>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Mistakes */}
                        {item.mistakes && item.mistakes.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-purple-400" />
                              Détail des fautes ({item.mistakes.length})
                            </h4>
                            <div className="space-y-3">
                              {item.mistakes.map((mistake, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl"
                                >
                                  <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 flex items-center justify-center bg-purple-500/20 text-purple-400 text-sm font-bold rounded-full flex-shrink-0">
                                      {idx + 1}
                                    </span>
                                    <div className="flex-1 space-y-3">
                                      {/* Type & Correction */}
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getMistakeTypeColor(mistake.type)} capitalize`}>
                                          {mistake.type}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-red-400 line-through font-medium">{mistake.original}</span>
                                          <span className="text-slate-500">→</span>
                                          <span className="text-green-400 font-medium">{mistake.correction}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Explanation */}
                                      <div className="p-3 bg-slate-800/50 rounded-lg">
                                        <p className="text-sm text-slate-300">
                                          <span className="text-purple-400 font-medium">Explication : </span>
                                          {mistake.explanation}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {item.summary && (
                          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                            <h4 className="text-sm font-medium text-purple-400 mb-2">Résumé</h4>
                            <p className="text-sm text-slate-300">{item.summary}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucune correction</h3>
              <p className="text-slate-500">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? 'Aucun résultat ne correspond à vos filtres'
                  : 'Vos corrections apparaîtront ici'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;

