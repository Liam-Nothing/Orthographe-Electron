import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Liste des icônes disponibles
const availableIcons = [
  'Mail', 'MessageCircle', 'FileText', 'Briefcase', 'GraduationCap',
  'PenTool', 'BookOpen', 'Newspaper', 'Globe', 'Users',
  'Heart', 'Star', 'Zap', 'Coffee', 'Code'
];

const getIcon = (iconName) => {
  return Icons[iconName] || Icons.FileText;
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    icon: 'FileText',
    enabled: true,
    preprompt: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    if (window.electronAPI) {
      const cats = await window.electronAPI.getCategories();
      setCategories(cats);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditForm({
      name: '',
      icon: 'FileText',
      enabled: true,
      preprompt: ''
    });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      icon: category.icon,
      enabled: category.enabled,
      preprompt: category.preprompt
    });
  };

  const handleSave = async () => {
    if (!editForm.name.trim() || !editForm.preprompt.trim()) {
      return;
    }

    if (window.electronAPI) {
      if (isAdding) {
        const newCategory = {
          id: uuidv4(),
          ...editForm
        };
        await window.electronAPI.addCategory(newCategory);
      } else if (editingId) {
        await window.electronAPI.updateCategory({
          id: editingId,
          ...editForm
        });
      }
      
      await loadCategories();
      setEditingId(null);
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      if (window.electronAPI) {
        await window.electronAPI.deleteCategory(categoryId);
        await loadCategories();
      }
    }
  };

  const handleToggle = async (category) => {
    if (window.electronAPI) {
      await window.electronAPI.updateCategory({
        ...category,
        enabled: !category.enabled
      });
      await loadCategories();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Catégories</h1>
          <p className="text-slate-400">Gérez vos catégories et personnalisez les pré-prompts</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto">
        {/* Add form */}
        {isAdding && (
          <div className="mb-6 p-6 bg-slate-800/50 border border-purple-500/30 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Nouvelle catégorie</h3>
            <CategoryForm
              form={editForm}
              setForm={setEditForm}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Categories list */}
        <div className="space-y-4">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            const isEditing = editingId === category.id;

            return (
              <div
                key={category.id}
                className={`p-6 bg-slate-800/50 border rounded-2xl transition-all ${
                  isEditing ? 'border-purple-500/50' : 'border-slate-700'
                }`}
              >
                {isEditing ? (
                  <CategoryForm
                    form={editForm}
                    setForm={setEditForm}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ) : (
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${
                      category.enabled
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-slate-700 text-slate-500'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          category.enabled ? 'text-white' : 'text-slate-500'
                        }`}>
                          {category.name}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          category.enabled
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-700 text-slate-500'
                        }`}>
                          {category.enabled ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{category.preprompt}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(category)}
                        className={`p-2 rounded-lg transition-all ${
                          category.enabled
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
                        }`}
                        title={category.enabled ? 'Désactiver' : 'Activer'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white rounded-lg transition-all"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {categories.length === 0 && !isAdding && (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">Aucune catégorie configurée</p>
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter une catégorie
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Form component
function CategoryForm({ form, setForm, onSave, onCancel }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Nom de la catégorie
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Email professionnel"
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Icône
          </label>
          <div className="flex flex-wrap gap-2">
            {availableIcons.map((iconName) => {
              const Icon = Icons[iconName];
              return (
                <button
                  key={iconName}
                  onClick={() => setForm({ ...form, icon: iconName })}
                  className={`p-2 rounded-lg transition-all ${
                    form.icon === iconName
                      ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                      : 'bg-slate-800 text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                  title={iconName}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Pré-prompt (instructions pour l'IA)
        </label>
        <textarea
          value={form.preprompt}
          onChange={(e) => setForm({ ...form, preprompt: e.target.value })}
          placeholder="Décrivez le contexte et les instructions spécifiques pour cette catégorie..."
          rows={4}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-all flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <button
          onClick={onSave}
          disabled={!form.name.trim() || !form.preprompt.trim()}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl transition-all flex items-center gap-2 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Enregistrer
        </button>
      </div>
    </div>
  );
}

export default Categories;

