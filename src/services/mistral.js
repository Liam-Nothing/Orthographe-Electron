// Service pour interagir avec Mistral AI

const SYSTEM_PROMPT_BASE = `Tu es un assistant expert en correction orthographique et grammaticale française.

IMPORTANT: Tu dois TOUJOURS répondre en JSON valide avec exactement cette structure:
{
  "correctedText": "Le texte corrigé ici",
  "mistakes": [
    {
      "type": "orthographe|grammaire|conjugaison|syntaxe|ponctuation|accord|style",
      "original": "le mot ou phrase incorrect",
      "correction": "la correction",
      "explanation": "Explication de la règle"
    }
  ],
  "summary": "Un bref résumé des principales corrections"
}

Règles:
- "correctedText" contient le texte entièrement corrigé, prêt à être copié
- "mistakes" liste TOUTES les fautes trouvées avec leur type, l'original, la correction et une explication pédagogique
- Si aucune faute n'est trouvée, "mistakes" doit être un tableau vide []
- "summary" donne un aperçu global des types d'erreurs et conseils d'amélioration
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après`;

export async function correctText(text, category, apiKey, model = 'mistral-large-latest') {
  if (!text || !text.trim()) {
    throw new Error('Le texte est vide');
  }

  if (!apiKey) {
    throw new Error('Clé API non configurée');
  }

  const systemPrompt = category?.preprompt 
    ? `${SYSTEM_PROMPT_BASE}\n\nContexte spécifique: ${category.preprompt}`
    : SYSTEM_PROMPT_BASE;

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Corrige ce texte:\n\n${text}`
          }
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Clé API invalide. Vérifiez votre clé dans les paramètres.');
      }
      if (response.status === 429) {
        throw new Error('Limite de requêtes atteinte. Réessayez dans quelques instants.');
      }
      if (response.status === 400) {
        throw new Error(errorData.message || 'Requête invalide');
      }
      
      throw new Error(`Erreur API: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Réponse vide de l\'API');
    }

    // Parser le JSON de la réponse
    const result = JSON.parse(content);

    // Valider la structure
    if (!result.correctedText) {
      throw new Error('Format de réponse invalide: correctedText manquant');
    }

    return {
      correctedText: result.correctedText,
      mistakes: result.mistakes || [],
      summary: result.summary || 'Correction effectuée.'
    };

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Erreur de parsing de la réponse IA. Réessayez.');
    }
    throw error;
  }
}

export async function validateApiKey(apiKey) {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, error: 'Clé API invalide ou trop courte' };
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return { valid: true };
    }

    if (response.status === 401) {
      return { valid: false, error: 'Clé API invalide' };
    }

    return { valid: false, error: `Erreur de validation: ${response.status}` };

  } catch (error) {
    return { valid: false, error: 'Impossible de valider la clé. Vérifiez votre connexion.' };
  }
}

