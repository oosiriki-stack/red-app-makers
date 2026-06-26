import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const encoder = new TextEncoder();

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function latestUserMessage(messages: ChatMessage[]) {
  return cleanText([...messages].reverse().find((m) => m.role === "user")?.content);
}

function extractContextValue(context: string, key: string) {
  const match = context.match(new RegExp(`${key}\\s*:\\s*([^,\n]+)`, "i"));
  return cleanText(match?.[1]);
}

function buildExpertAnswer(messages: ChatMessage[], context = "") {
  const question = latestUserMessage(messages);
  const lower = question.toLowerCase();
  const brand = extractContextValue(context, "Marque") || "votre surveillance";
  const person = extractContextValue(context, "Personne");
  const target = person && person !== "non définie" ? `${brand} / ${person}` : brand;

  if (/crise|bad buzz|urgence|communiqu[ée]|attaque|menace|pol[ée]mique|viral/i.test(lower)) {
    return `## Plan de crise immédiat — ${target}

**1. Qualification en 15 minutes**
- Identifier le fait déclencheur, la source initiale et les comptes qui amplifient.
- Classer le risque : faible, sensible, critique.
- Bloquer toute réponse improvisée tant que les faits ne sont pas validés.

**2. Réponse publique courte**
> Nous avons bien pris connaissance des réactions en cours. Notre équipe vérifie les éléments avec sérieux et revient rapidement avec une réponse claire. Merci pour vos signalements.

**3. Réponse empathique aux commentaires**
> Merci pour votre message. Nous comprenons votre préoccupation. Pouvez-vous nous envoyer les détails en privé afin que notre équipe traite le sujet rapidement ?

**4. Actions de stabilisation**
- Répondre d'abord aux mentions à forte visibilité.
- Utiliser un ton calme, factuel et responsable.
- Préparer un point de situation toutes les 2 heures jusqu'au retour à la normale.

**5. Après-crise**
- Documenter les causes, les réponses, les délais et les apprentissages.
- Transformer les commentaires récurrents en actions correctives visibles.`;
  }

  if (/r[ée]pond|avis|commentaire|message|client|plainte|n[ée]gatif/i.test(lower)) {
    return `## Brouillon de réponse — ${target}

Bonjour,

Merci d'avoir pris le temps de partager votre retour. Nous sommes désolés que votre expérience n'ait pas été à la hauteur de vos attentes.

Notre équipe prend votre remarque au sérieux et souhaite comprendre précisément la situation afin d'apporter une solution rapide. Pouvez-vous nous transmettre les détails en message privé ?

Nous restons disponibles et revenons vers vous dans les meilleurs délais.

**Ton recommandé :** empathique, responsable, sans accusation.

**À éviter :** contredire publiquement, minimiser le ressenti, promettre une solution non vérifiée.`;
  }

  if (/rapport|r[ée]sum[ée]|synth[eè]se|semaine|mois|direction|dg|pdg/i.test(lower)) {
    return `## Synthèse exécutive — ${target}

**Lecture rapide**
- Surveiller l'évolution du volume de mentions, surtout les pics négatifs.
- Prioriser les sources à forte portée : réseaux sociaux, presse, forums et RSS Watch.
- Comparer les thèmes récurrents avec les alertes ouvertes.

**Points à mettre dans le rapport**
1. Volume total et évolution par jour.
2. Répartition positif / neutre / négatif.
3. Mentions critiques et réponses recommandées.
4. Signaux concurrents et opportunités.
5. Actions décidées, responsables et échéances.

**Conclusion type**
La réputation de ${target} doit être pilotée en continu avec une priorité sur les signaux faibles, les avis authentiques et les réactions à forte visibilité.`;
  }

  if (/concurrent|part de voix|benchmark|compar/i.test(lower)) {
    return `## Analyse concurrence — ${target}

**Méthode recommandée**
- Comparer le volume de mentions par concurrent.
- Isoler les mentions positives liées au produit, au prix, au service et à la confiance.
- Repérer les critiques fréquentes chez les concurrents pour créer des opportunités de communication.

**Plan d'action**
1. Construire une matrice : concurrent, volume, sentiment, thème dominant, risque.
2. Répondre aux opportunités avec des preuves concrètes.
3. Surveiller les pics anormaux chez les concurrents pour anticiper les tendances marché.

**Angle de communication**
Mettre en avant ce que ${target} fait mieux, sans attaquer directement les autres marques.`;
  }

  return `## FocusGPT — mode expert gratuit activé

Je fonctionne maintenant sans consommation de crédits IA pour vous assister sur ${target}.

**Réponse à votre demande**
${question || "Décrivez la mention, la crise ou le rapport à préparer."}

**Recommandation professionnelle**
- Vérifiez d'abord si la mention correspond exactement à votre configuration de surveillance.
- Priorisez les contenus récents, authentiques et visibles.
- Classez chaque réaction en positif, neutre ou négatif avant de répondre.
- En cas de doute, adoptez une réponse courte, empathique et factuelle.

**Modèle de réponse rapide**
> Merci pour votre retour. Nous avons bien pris note de votre message et notre équipe vérifie les éléments afin d'apporter une réponse utile et rapide.

Vous pouvez me demander : un plan de crise, une réponse à un avis, une synthèse de rapport ou une analyse concurrentielle.`;
}

function sseResponse(text: string) {
  const stream = new ReadableStream({
    start(controller) {
      const parts = text.match(/[\s\S]{1,180}/g) ?? [text];
      for (const part of parts) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: part } }] })}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ---- Auth check (prevent unauthenticated AI credit drain) ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, context } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return sseResponse(buildExpertAnswer(messages, context));
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
