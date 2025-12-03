import { PenTool, LayoutDashboard, FolderOpen, Settings, Sparkles } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Correction', icon: PenTool },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'categories', label: 'Catégories', icon: FolderOpen },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">Orthographe</h1>
            <p className="text-xs text-slate-500">Mistral AI</p>
          </div>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="px-4 py-3 bg-slate-800/50 rounded-xl">
          <p className="text-xs text-slate-500 mb-1">Propulsé par</p>
          <p className="text-sm text-slate-300 font-medium">Mistral AI</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

