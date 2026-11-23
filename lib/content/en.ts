/**
 * English: the source dictionary. Every other language must match this shape
 * (the `Dict` type enforces it). `{x}` marks a value filled in at runtime.
 * Brand and product names (Anthemius, Studio…) are not translated.
 */
export const en = {
  meta: {
    title: "Black Friday: one month of Anthemius Studio for $0.99",
    description:
      "Design, dress and walk interior spaces in the browser. Until 30 November, your first month of Anthemius Studio is $0.99 in the US, €0,99 in Europe and ₹99 in India.",
  },
  langName: "English",
  banner: {
    text: "This page is available in English.",
    switch: "View in English",
    stay: "Stay in English",
  },
  skip: "Skip to the offer",
  nav: { home: "Anthemius home", language: "Language" },
  ends: { short: "30 November", long: "30 November 2026" },
  regions: {
    us: { label: "United States", spoken: "99 cents" },
    eu: { label: "Europe", spoken: "99 euro cents" },
    in: { label: "India", spoken: "99 rupees" },
  },
  hero: {
    kicker: "Black Friday offer, until {date}",
    priceFor: "for your first month of ",
    priceForEnd: "",
    lede: "Anthemius is the editor where you lay out an interior, revise it in a few clicks, dress it in 3D and walk your client through it. This week, a full month on the paid plan costs {price}.",
    cta: "Start my month of {plan}",
    fine: "Runs in the browser. Nothing to install.",
    plateAlt: "A lounge with a teal feature wall, oak floor and woven pendant lights, designed in Anthemius",
    plateCaption: ["Lounge, office floor", "Designed and rendered in Anthemius"],
  },
  adds: {
    h2: "What {plan} adds",
    p: "The free plan lets you design and experiment without limits. {plan} is for the moment the work goes to a client.",
    items: [
      { title: "Clean exports", body: "CAD files and drawings without the watermark, ready to send to a client or a contractor." },
      { title: "Priority support", body: "Questions answered first, by the people who build the product." },
      { title: "Team collaboration", body: "Bring your team into the same project." },
      { title: "Custom materials and furniture", body: "Add your own materials and furniture beyond the preset library." },
      { title: "Bill of materials", body: "A material list with quantities, straight from the plan." },
    ],
  },
  month: {
    h2a: "One plan, from first wall",
    h2b1: "to ",
    h2b2: "final quantities.",
    p: "Lay it out, edit it, dress it, walk it and quantify it. All in one file, in your browser.",
    screenAlt: "The Anthemius editor: a 2D office plan on the left and the same floor in 3D on the right",
    screenCaption: "The plan and the 3D model are one file. Edit either and the other follows.",
    steps: [
      ["Lay out", "Draw the plan, import a DXF, or generate a first layout from your zones."],
      ["Edit", "Move a wall or swap a room. Areas, the 3D model and the costs follow."],
      ["Dress", "Apply finishes and lighting in Studio, then set the time of day."],
      ["Walk", "Step inside the space with your client, in the meeting."],
      ["Quantify", "Take the material list and floor cost straight from the plan."],
    ],
  },
  rates: {
    h2: "The same offer, wherever you work",
    p: "One month of {plan}, priced for your market. Your region is selected automatically.",
    caption: "Black Friday price by region",
    region: "Region",
    month: "First month of {plan}",
    billed: "Billed in",
    then: "Then, per user / month",
    yours: "Your region",
  },
  close: {
    h2a: "{price} buys the month.",
    h2b: "The project is yours to keep.",
    cta: "Start my month of {plan}",
    termsTitle: "Offer terms",
    terms: [
      "The promotional price applies to the first month of one {plan} subscription per account.",
      "Offer available until {endsOn}.",
      "After the promotional month, the standard monthly price for your region applies unless you cancel before renewal.",
    ],
  },
  dock: { suffix: "first month of {plan}", cta: "Start" },
  footer: {
    pricing: "Pricing",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    copy: "© 2026 Anthemius.",
  },
  legal: {
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    close: "Close",
    loading: "Loading…",
    missing: "This document is not available yet.",
  },
  consent: {
    title: "Cookies",
    text: "We use a few cookies to remember your language and currency, and to suggest the right language for you. No tracking, no ads.",
    accept: "Accept all",
    necessary: "Only necessary",
    privacy: "Privacy Policy",
    settings: "Cookie settings",
  },
};

export type Dict = typeof en;
