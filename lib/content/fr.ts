import type { Dict } from "./en";

export const fr: Dict = {
  meta: {
    title: "Black Friday : un mois d’Anthemius Pro pour €0,99",
    description:
      "Concevez, aménagez et visitez des intérieurs dans le navigateur. Jusqu’au 30 novembre, votre premier mois d’Anthemius Pro coûte $0.99 aux États-Unis, €0,99 en Europe et ₹99 en Inde.",
  },
  langName: "French",
  banner: {
    text: "Cette page est disponible en français.",
    switch: "Voir en français",
    stay: "Rester en anglais",
  },
  skip: "Aller à l’offre",
  nav: { home: "Accueil Anthemius", language: "Langue" },
  ends: { short: "30 novembre", long: "30 novembre 2026" },
  regions: {
    us: { label: "États-Unis", spoken: "99 cents" },
    eu: { label: "Europe", spoken: "99 centimes d’euro" },
    in: { label: "Inde", spoken: "99 roupies" },
  },
  hero: {
    kicker: "Offre Black Friday, jusqu’au {date}",
    priceFor: "pour votre premier mois d’",
    priceForEnd: "",
    lede: "Anthemius est l’éditeur où vous agencez un intérieur, le révisez en quelques clics, l’habillez en 3D et le faites visiter à votre client. Cette semaine, un mois complet sur l’offre payante coûte {price}.",
    cta: "Commencer mon mois de {plan}",
    fine: "Fonctionne dans le navigateur. Rien à installer.",
    plateAlt: "Un salon avec un mur d’accent bleu-vert, un parquet en chêne et des suspensions tressées, conçu dans Anthemius",
    plateCaption: ["Salon, étage de bureaux", "Conçu et rendu dans Anthemius"],
  },
  adds: {
    h2: "Ce qu’ajoute {plan}",
    p: "L’offre gratuite vous permet de concevoir et d’expérimenter sans limite. {plan} est pour le moment où le travail part chez un client.",
    items: [
      { title: "Exports propres", body: "Fichiers CAO et plans sans filigrane, prêts à envoyer à un client ou à un entrepreneur." },
      { title: "3D sans filigrane", body: "Présentez le modèle comme votre propre travail, à l’écran ou via un lien partagé." },
      { title: "Mode visite et finitions de matériaux", body: "Entrez dans l’espace avec sols, murs et éclairages issus de la bibliothèque de préréglages." },
      { title: "Support prioritaire", body: "Vos questions sont traitées en premier, par les personnes qui construisent le produit." },
    ],
  },
  month: {
    h2a: "Un mois suffit",
    h2b1: "pour un ",
    h2b2: "projet entier.",
    quote: "« J’ai pu créer le projet en 15 minutes avec Anthemius, alors qu’il faut généralement 5 à 7 jours. »",
    cite: "Pratik Ghodke, premier utilisateur",
    screenAlt: "L’éditeur Anthemius : un plan 2D de bureau à gauche et le même étage en 3D à droite",
    screenCaption: "Le plan et le modèle 3D forment un seul fichier. Modifiez l’un, l’autre suit.",
    steps: [
      ["Agencer", "Dessinez le plan, importez un DXF ou générez une première disposition à partir de vos zones."],
      ["Modifier", "Déplacez un mur ou changez une pièce. Les surfaces, le modèle 3D et les coûts suivent."],
      ["Habiller", "Appliquez finitions et éclairages dans Studio, puis réglez l’heure de la journée."],
      ["Visiter", "Entrez dans l’espace avec votre client, pendant la réunion."],
      ["Chiffrer", "Sortez la liste des matériaux et le coût des sols directement du plan."],
    ],
  },
  rates: {
    h2: "La même offre, où que vous travailliez",
    p: "Un mois de {plan}, au prix de votre marché. Votre région est sélectionnée automatiquement.",
    caption: "Prix Black Friday par région",
    region: "Région",
    month: "Premier mois de {plan}",
    billed: "Facturé en",
    yours: "Votre région",
  },
  close: {
    h2a: "{price} achète le mois.",
    h2b: "Le projet reste à vous.",
    cta: "Commencer mon mois de {plan}",
    termsTitle: "Conditions de l’offre",
    terms: [
      "Le prix promotionnel s’applique au premier mois d’un abonnement {plan} par compte.",
      "Offre valable jusqu’au {endsOn}.",
      "Après le mois promotionnel, le tarif mensuel standard de votre région s’applique sauf résiliation avant le renouvellement.",
    ],
  },
  dock: { suffix: "premier mois de {plan}", cta: "Commencer" },
  footer: {
    pricing: "Tarifs",
    terms: "Conditions d’utilisation",
    privacy: "Politique de confidentialité",
    copy: "© 2026 Anthemius.",
  },
  consent: {
    title: "Cookies",
    text: "Nous utilisons quelques cookies pour mémoriser votre langue et votre devise, et vous proposer la bonne langue. Aucun pistage, aucune publicité.",
    accept: "Tout accepter",
    necessary: "Uniquement les nécessaires",
    privacy: "Politique de confidentialité",
    settings: "Paramètres des cookies",
  },
};
