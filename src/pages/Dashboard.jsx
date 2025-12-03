import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Trash2, Download } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

function Dashboard() {
  const [statistics, setStatistics] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (window.electronAPI) {
      const [stats, hist] = await Promise.all([
        window.electronAPI.getStatistics(),
        window.electronAPI.getErrorHistory()
      ]);
      setStatistics(stats);
      setHistory(hist);
    }
    setIsLoading(false);
  };

  const handleExport = async () => {
    if (window.electronAPI) {
      const data = await window.electronAPI.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orthographe-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ?')) {
      if (window.electronAPI) {
        await window.electronAPI.resetData({ history: true, statistics: true });
        loadData();
      }
    }
  };

  // Préparer les données pour les graphiques
  const errorTypeData = statistics?.errorTypes
    ? Object.entries(statistics.errorTypes)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  // Données des 7 derniers jours
  const getLast7DaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayHistory = history.filter(h => h.date.startsWith(dateStr));
      days.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        corrections: dayHistory.length,
        erreurs: dayHistory.reduce((acc, h) => acc + (h.mistakes?.length || 0), 0)
      });
    }
    return days;
  };

  // Top 5 des fautes les plus fréquentes
  const getTopMistakes = () => {
    const mistakeCount = {};
    history.forEach(h => {
      h.mistakes?.forEach(m => {
        const key = `${m.original} → ${m.correction}`;
        mistakeCount[key] = (mistakeCount[key] || 0) + 1;
      });
    });
    return Object.entries(mistakeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const last7Days = getLast7DaysData();
  const topMistakes = getTopMistakes();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Analysez vos fautes et suivez votre progression</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-all"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto">
        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-slate-400 text-sm">Corrections totales</span>
            </div>
            <p className="text-3xl font-bold text-white">{statistics?.totalCorrections || 0}</p>
          </div>
          
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-slate-400 text-sm">Fautes détectées</span>
            </div>
            <p className="text-3xl font-bold text-white">{statistics?.totalErrors || 0}</p>
          </div>
          
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-slate-400 text-sm">Moy. fautes/texte</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {statistics?.totalCorrections > 0
                ? (statistics.totalErrors / statistics.totalCorrections).toFixed(1)
                : '0'}
            </p>
          </div>
          
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-slate-400 text-sm">Types d'erreurs</span>
            </div>
            <p className="text-3xl font-bold text-white">{errorTypeData.length}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Activity chart */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Activité des 7 derniers jours</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#f1f5f9' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Line type="monotone" dataKey="corrections" stroke="#8b5cf6" strokeWidth={2} name="Corrections" />
                  <Line type="monotone" dataKey="erreurs" stroke="#ef4444" strokeWidth={2} name="Erreurs" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error types pie chart */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Répartition des types d'erreurs</h3>
            {errorTypeData.length > 0 ? (
              <div className="h-64 flex items-center">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie
                      data={errorTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {errorTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {errorTypeData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-slate-400 capitalize">{entry.name}</span>
                      <span className="text-sm text-slate-500 ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Top mistakes & Error type bar chart */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top mistakes */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Top 5 des fautes récurrentes</h3>
            {topMistakes.length > 0 ? (
              <div className="space-y-3">
                {topMistakes.map((mistake, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-400 text-sm font-medium rounded-full">
                        {index + 1}
                      </span>
                      <span className="text-slate-300 text-sm">{mistake.name}</span>
                    </div>
                    <span className="text-slate-500 text-sm">{mistake.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500">
                Aucune faute enregistrée
              </div>
            )}
          </div>

          {/* Error types bar chart */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Erreurs par catégorie</h3>
            {errorTypeData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

