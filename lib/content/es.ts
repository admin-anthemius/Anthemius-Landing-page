import type { Dict } from "./en";

export const es: Dict = {
  meta: {
    title: "Black Friday: un mes de Anthemius Pro por €0,99",
    description:
      "Diseña, viste y recorre interiores en el navegador. Hasta el 30 de noviembre, tu primer mes de Anthemius Pro cuesta $0.99 en EE. UU., €0,99 en Europa y ₹99 en la India.",
  },
  langName: "Spanish",
  banner: {
    text: "Esta página está disponible en español.",
    switch: "Ver en español",
    stay: "Seguir en inglés",
  },
  skip: "Ir a la oferta",
  nav: { home: "Inicio de Anthemius", language: "Idioma" },
  ends: { short: "30 de noviembre", long: "30 de noviembre de 2026" },
  regions: {
    us: { label: "Estados Unidos", spoken: "99 centavos" },
    eu: { label: "Europa", spoken: "99 céntimos de euro" },
    in: { label: "India", spoken: "99 rupias" },
  },
  hero: {
    kicker: "Oferta de Black Friday, hasta el {date}",
    priceFor: "por tu primer mes de ",
    priceForEnd: "",
    lede: "Anthemius es el editor donde distribuyes un interior, lo revisas en unos clics, lo vistes en 3D y recorres el espacio con tu cliente. Esta semana, un mes completo del plan de pago cuesta {price}.",
    cta: "Empezar mi mes de {plan}",
    fine: "Funciona en el navegador. Nada que instalar.",
    plateAlt: "Un salón con una pared de acento verde azulado, suelo de roble y lámparas colgantes de mimbre, diseñado en Anthemius",
    plateCaption: ["Salón, planta de oficinas", "Diseñado y renderizado en Anthemius"],
  },
  adds: {
    h2: "Qué añade {plan}",
    p: "El plan gratuito te permite diseñar y experimentar sin límites. {plan} es para el momento en que el trabajo llega a un cliente.",
    items: [
      { title: "Exportaciones limpias", body: "Archivos CAD y planos sin marca de agua, listos para enviar a un cliente o a un contratista." },
      { title: "3D sin marca de agua", body: "Presenta el modelo como trabajo propio, en pantalla o en un enlace compartido." },
      { title: "Modo paseo y acabados de materiales", body: "Entra en el espacio con suelos, paredes e iluminación de la biblioteca de ajustes preestablecidos." },
      { title: "Soporte prioritario", body: "Tus preguntas se responden primero, por las personas que construyen el producto." },
    ],
  },
  month: {
    h2a: "Un mes es suficiente",
    h2b1: "para un ",
    h2b2: "proyecto entero.",
    quote: "“Pude crear el proyecto en 15 minutos con Anthemius, cuando normalmente lleva de 5 a 7 días.”",
    cite: "Pratik Ghodke, usuario temprano",
    screenAlt: "El editor de Anthemius: un plano 2D de oficina a la izquierda y la misma planta en 3D a la derecha",
    screenCaption: "El plano y el modelo 3D son un solo archivo. Edita uno y el otro lo sigue.",
    steps: [
      ["Distribuir", "Dibuja el plano, importa un DXF o genera una primera distribución a partir de tus zonas."],
      ["Editar", "Mueve un muro o cambia una estancia. Las superficies, el modelo 3D y los costes se actualizan."],
      ["Vestir", "Aplica acabados e iluminación en Studio y fija la hora del día."],
      ["Recorrer", "Entra en el espacio con tu cliente, durante la reunión."],
      ["Cuantificar", "Obtén la lista de materiales y el coste del suelo directamente del plano."],
    ],
  },
  rates: {
    h2: "La misma oferta, trabajes donde trabajes",
    p: "Un mes de {plan}, con precio para tu mercado. Tu región se selecciona automáticamente.",
    caption: "Precio de Black Friday por región",
    region: "Región",
    month: "Primer mes de {plan}",
    billed: "Facturado en",
    yours: "Tu región",
  },
  close: {
    h2a: "{price} compra el mes.",
    h2b: "El proyecto es tuyo para siempre.",
    cta: "Empezar mi mes de {plan}",
    termsTitle: "Condiciones de la oferta",
    terms: [
      "El precio promocional se aplica al primer mes de una suscripción {plan} por cuenta.",
      "Oferta disponible hasta el {endsOn}.",
      "Después del mes promocional se aplica el precio mensual estándar de tu región, salvo que canceles antes de la renovación.",
    ],
  },
  dock: { suffix: "primer mes de {plan}", cta: "Empezar" },
  footer: {
    pricing: "Precios",
    terms: "Condiciones de uso",
    privacy: "Política de privacidad",
    copy: "© 2026 Anthemius.",
  },
  consent: {
    title: "Cookies",
    text: "Usamos algunas cookies para recordar tu idioma y tu moneda, y para sugerirte el idioma adecuado. Sin rastreo ni publicidad.",
    accept: "Aceptar todas",
    necessary: "Solo las necesarias",
    privacy: "Política de privacidad",
    settings: "Configuración de cookies",
  },
};
