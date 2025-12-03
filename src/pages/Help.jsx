import { ArrowLeft, ExternalLink, Key, CheckCircle, AlertCircle } from 'lucide-react';

function Help({ onBack }) {
  const openExternal = (url) => {
    if (window.electronAPI) {
      window.electronAPI.openExternal(url);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Créer un compte Mistral",
      description: "Rendez-vous sur la console Mistral et créez un compte gratuit si vous n'en avez pas.",
      action: {
        label: "Ouvrir console.mistral.ai",
        url: "https://console.mistral.ai/"
      },
      placeholder: "screenshot-step1.png",
      placeholderText: "Capture d'écran de la page d'inscription Mistral"
    },
    {
      number: 2,
      title: "Donner un nom à votre équipe",
      description: "Après l'inscription, Mistral vous demande de créer une équipe. Entrez un nom (par exemple votre prénom ou 'Personnel') et validez.",
      placeholder: "screenshot-step2.png",
      placeholderText: "Capture d'écran de la page de création d'équipe"
    },
    {
      number: 3,
      title: "Choisir un plan",
      description: "Mistral vous propose différents plans d'abonnement. Sélectionnez celui qui vous convient.",
      placeholder: "screenshot-step3.png",
      placeholderText: "Capture d'écran de la page de sélection des plans"
    },
    {
      number: 4,
      title: "Sélectionner le plan gratuit",
      description: "Cliquez sur le plan gratuit ('Free' ou 'Experiment') pour commencer sans frais. Ce plan est suffisant pour un usage personnel.",
      placeholder: "screenshot-step4.png",
      placeholderText: "Capture d'écran montrant le plan gratuit à sélectionner"
    },
    {
      number: 5,
      title: "Vérifier votre numéro de téléphone",
      description: "Pour des raisons de sécurité, Mistral demande de vérifier votre numéro de téléphone. Entrez votre numéro et validez avec le code reçu par SMS.",
      placeholder: "screenshot-step5.png",
      placeholderText: "Capture d'écran de la vérification du téléphone"
    },
    {
      number: 6,
      title: "Créer et copier votre clé API",
      description: "Accédez au dashboard API, cliquez sur 'Créer une nouvelle clé', renseignez un nom (ex: 'Orthographe App'), puis copiez immédiatement la clé générée. ⚠️ Elle ne sera plus visible après !",
      action: {
        label: "Ouvrir le dashboard API",
        url: "https://console.mistral.ai/api-keys/"
      },
      placeholder: "screenshot-step6.png",
      placeholderText: "Capture d'écran du dashboard API et de la création de clé"
    },
    {
      number: 7,
      title: "Coller dans l'application",
      description: "Retournez sur la page de configuration de l'application et collez votre clé API dans le champ prévu, puis cliquez sur 'Valider'. C'est terminé !",
      placeholder: null,
      placeholderText: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-y-auto">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto p-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la configuration
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-2xl shadow-amber-500/30 mb-6">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Comment obtenir votre clé API Mistral
          </h1>
          <p className="text-slate-400 text-lg">
            Suivez ces étapes simples pour configurer l'application
          </p>
        </div>

        {/* Info box */}
        <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-300 font-medium">À propos des clés API Mistral</p>
              <p className="text-slate-400 text-sm mt-1">
                Mistral offre un crédit gratuit pour commencer. Vous pouvez utiliser les modèles 
                comme Mistral Large pour des corrections de haute qualité. Les tarifs sont très 
                abordables pour un usage personnel.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                {/* Step number */}
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white font-bold flex-shrink-0">
                  {step.number}
                </div>

                <div className="flex-1">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 mb-4">
                    {step.description}
                  </p>

                  {/* Action button */}
                  {step.action && (
                    <button
                      onClick={() => openExternal(step.action.url)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-300 transition-colors mb-4"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {step.action.label}
                    </button>
                  )}

                  {/* Screenshot */}
                  {step.placeholder && (
                    <div className="rounded-xl overflow-hidden border border-slate-700">
                      <img 
                        src={`${import.meta.env.BASE_URL}${step.placeholder}`}
                        alt={step.placeholderText}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success message */}
        <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">C'est terminé !</h3>
          </div>
          <p className="text-slate-400">
            Une fois votre clé API validée, vous pourrez commencer à corriger vos textes 
            et améliorer votre orthographe avec l'aide de Mistral AI.
          </p>
        </div>

        {/* Back to setup button */}
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-purple-500/30"
          >
            Retour à la configuration
          </button>
        </div>
      </div>
    </div>
  );
}

export default Help;

