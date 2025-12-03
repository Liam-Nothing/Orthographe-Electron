# 📝 Orthographe Mistral

> **Application desktop intelligente de correction orthographique et grammaticale propulsée par Mistral AI**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🎯 Objectif du Projet

**Orthographe Mistral** est une application desktop conçue pour améliorer vos compétences en écriture de manière proactive. Contrairement aux correcteurs orthographiques classiques qui se contentent de corriger vos erreurs, cette application va plus loin :

1. **Correction intelligente** : Utilise Mistral AI pour corriger l'orthographe, la grammaire et le style
2. **Analyse personnalisée** : Identifie et explique vos erreurs récurrentes
3. **Apprentissage progressif** : Stocke localement vos erreurs pour créer un profil d'amélioration
4. **Dashboard analytique** : Visualisez vos fautes les plus fréquentes et suivez votre progression

---

## ✨ Fonctionnalités Principales

### 🔤 Correction Multi-Contexte

L'application propose des **catégories de texte** avec des pré-prompts personnalisés :

| Catégorie | Icône | Description |
|-----------|-------|-------------|
| **Email** | 📧 | Correction adaptée aux communications professionnelles |
| **Académique** | 🎓 | Style formel pour travaux universitaires et rapports |
| **Informel** | 💬 | Messages décontractés tout en restant correct |
| **Professionnel** | 💼 | Documents d'entreprise, présentations, rapports |

> 💡 **Personnalisable** : Ajoutez vos propres catégories et modifiez les pré-prompts selon vos besoins !

### 📋 Réponse en Deux Parties

Chaque correction génère une réponse structurée :

```
┌─────────────────────────────────────────────────────┐
│  📄 TEXTE CORRIGÉ                                   │
│  ─────────────────                                  │
│  Votre texte corrigé, prêt à copier-coller         │
│                                        [📋 Copier]  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📚 ANALYSE DES FAUTES                              │
│  ─────────────────────                              │
│  • Faute 1: "apparament" → "apparemment"           │
│    → Règle: Les adverbes en -ment gardent le 'e'   │
│                                                     │
│  • Faute 2: "je vais au coiffeur"                  │
│    → Règle: On va "chez" une personne, pas "au"    │
└─────────────────────────────────────────────────────┘
```

### 📊 Dashboard Analytique

Suivez votre progression avec des statistiques détaillées :

- **Graphiques** : Visualisez vos types d'erreurs les plus fréquentes
- **Historique** : Consultez l'évolution de vos fautes dans le temps
- **Catégorisation** : Erreurs classées par type (orthographe, grammaire, conjugaison, etc.)
- **Conseils personnalisés** : Recevez des recommandations basées sur vos fautes récurrentes

---

## 🏗️ Architecture

```
Orthographe-Electron/
├── 📁 electron/
│   ├── main.cjs          # Process principal Electron
│   └── preload.cjs       # Bridge sécurisé IPC
├── 📁 src/
│   ├── 📁 components/    # Composants React réutilisables
│   ├── 📁 pages/         # Pages de l'application
│   │   ├── Home.jsx      # Page de correction
│   │   ├── Dashboard.jsx # Analytics des erreurs
│   │   ├── Categories.jsx# Gestion des catégories
│   │   └── Settings.jsx  # Configuration
│   ├── 📁 stores/        # Gestion d'état (stockage local)
│   ├── 📁 services/      # Services (Mistral AI, stockage)
│   ├── App.jsx           # Composant racine
│   └── main.jsx          # Point d'entrée React
├── config.default.json   # Configuration par défaut
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Clé API Mistral** ([Obtenir une clé](https://console.mistral.ai/))

### Installation

```bash
# Cloner le repository
git clone https://github.com/Liam-Nothing/Orthographe-Electron.git
cd Orthographe-Electron

# Installer les dépendances
npm install

# Configurer l'API Mistral
# Copier config.default.json vers config.json et ajouter votre clé
```

### Configuration

Créez un fichier `config.json` à la racine (ou `.env`) :

```json
{
  "MISTRAL_API_KEY": "votre-clé-api-mistral",
  "MISTRAL_MODEL": "mistral-large-latest"
}
```

### Lancement

```bash
# Mode développement
npm run dev

# Build production
npm run build:electron
```

---

## 📖 Guide d'Utilisation

### 1. Correction de Texte

1. Sélectionnez une **catégorie** (Email, Académique, etc.)
2. Collez ou tapez votre texte dans la zone de saisie
3. Cliquez sur **"Corriger"**
4. Récupérez le texte corrigé et consultez l'analyse des fautes

### 2. Gestion des Catégories

- Accédez à **Catégories** dans le menu
- **Ajoutez** de nouvelles catégories personnalisées
- **Modifiez** les pré-prompts existants pour adapter le comportement de l'IA
- **Activez/Désactivez** les catégories selon vos besoins

### 3. Consultation du Dashboard

- Accédez au **Dashboard** pour voir vos statistiques
- Visualisez vos **fautes les plus fréquentes**
- Suivez votre **progression** dans le temps
- Identifiez les **domaines à améliorer**

---

## 🔧 Technologies

| Technologie | Utilisation |
|-------------|-------------|
| **Electron** | Application desktop cross-platform |
| **React 19** | Interface utilisateur réactive |
| **Vite** | Build tool ultra-rapide |
| **Tailwind CSS** | Styling moderne et responsive |
| **Mistral AI** | Modèle de langage pour la correction |
| **Recharts** | Graphiques du dashboard |
| **React Router** | Navigation multi-pages |

---

## 📦 Structure des Données

### Stockage Local des Erreurs

```json
{
  "errors": [
    {
      "id": "uuid",
      "date": "2024-12-03T10:30:00Z",
      "category": "email",
      "original": "texte original",
      "corrected": "texte corrigé",
      "mistakes": [
        {
          "type": "orthographe",
          "original": "apparament",
          "correction": "apparemment",
          "explanation": "Les adverbes en -ment...",
          "rule": "adverbe-formation"
        }
      ]
    }
  ],
  "statistics": {
    "totalCorrections": 150,
    "commonMistakes": {
      "orthographe": 45,
      "grammaire": 30,
      "conjugaison": 25
    }
  }
}
```

---

## 🛣️ Roadmap

- [x] Structure de base Electron + React
- [ ] Interface de correction avec catégories
- [ ] Intégration Mistral AI
- [ ] Système de stockage local des erreurs
- [ ] Dashboard analytique avec graphiques
- [ ] Gestion des catégories personnalisées
- [ ] Export des statistiques (PDF/CSV)
- [ ] Mode hors-ligne avec cache
- [ ] Thèmes personnalisables

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add: AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👤 Auteur

**Liam-Nothing**

- GitHub: [@Liam-Nothing](https://github.com/Liam-Nothing)

---

<p align="center">
  <strong>🚀 Améliorez votre orthographe, une correction à la fois !</strong>
</p>

