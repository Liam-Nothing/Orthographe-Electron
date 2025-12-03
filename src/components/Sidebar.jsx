import { PenTool, LayoutDashboard, History, FolderOpen, Settings, Sparkles, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Correction', icon: PenTool },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'categories', label: 'Catégories', icon: FolderOpen },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

function Sidebar({ currentPage, onNavigate, isCollapsed, onToggle }) {
  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 relative`}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Logo */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-slate-800`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-white text-lg">Orthographe</h1>
              <p className="text-xs text-slate-500">Mistral AI</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2' : 'px-4'} py-3 rounded-xl border transition-colors duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-slate-800 space-y-3`}>
        {!isCollapsed && (
          <div className="px-4 py-3 bg-slate-800/50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Propulsé par</p>
            <p className="text-sm text-slate-300 font-medium">Mistral AI</p>
          </div>
        )}
        
        <button 
          onClick={() => window.electronAPI?.openExternal('https://sne.ovh/dZEdkk')}
          title={isCollapsed ? 'NothingElse.App' : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-2' : 'px-4 py-2'} rounded-xl hover:bg-slate-800/50 transition-colors group text-left`}
        >
          <img 
            src="/nea-logo.png" 
            alt="NothingElse.App" 
            className="w-6 h-6 rounded bg-white p-0.5 flex-shrink-0"
          />
          {!isCollapsed && (
            <>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Développé par</p>
                <p className="text-sm text-slate-400 group-hover:text-purple-400 transition-colors">NothingElse.App</p>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-purple-400 transition-colors" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
