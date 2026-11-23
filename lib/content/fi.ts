import type { Dict } from "./en";

export const fi: Dict = {
  meta: {
    title: "Black Friday: kuukausi Anthemius Prota hintaan €0,99",
    description:
      "Suunnittele, sisusta ja kävele sisätiloissa selaimessa. 30. marraskuuta asti ensimmäinen kuukautesi Anthemius Prota maksaa $0.99 Yhdysvalloissa, €0,99 Euroopassa ja ₹99 Intiassa.",
  },
  langName: "Finnish",
  banner: {
    text: "Tämä sivu on saatavilla suomeksi.",
    switch: "Näytä suomeksi",
    stay: "Jatka englanniksi",
  },
  skip: "Siirry tarjoukseen",
  nav: { home: "Anthemius etusivu", language: "Kieli" },
  ends: { short: "30. marraskuuta", long: "30. marraskuuta 2026" },
  regions: {
    us: { label: "Yhdysvallat", spoken: "99 senttiä" },
    eu: { label: "Eurooppa", spoken: "99 euron senttiä" },
    in: { label: "Intia", spoken: "99 rupiaa" },
  },
  hero: {
    kicker: "Black Friday -tarjous, {date} asti",
    priceFor: "ensimmäisestä ",
    priceForEnd: " -kuukaudestasi",
    lede: "Anthemius on editori, jossa suunnittelet tilan pohjan, muokkaat sitä muutamalla klikkauksella, sisustat sen 3D:ssä ja kuljet asiakkaasi kanssa sen läpi. Tällä viikolla kokonainen kuukausi maksullisella tasolla maksaa {price}.",
    cta: "Aloita {plan}-kuukauteni",
    fine: "Toimii selaimessa. Mitään ei tarvitse asentaa.",
    plateAlt: "Oleskelutila turkoosilla aksenttiseinällä, tammilattialla ja punotuilla riippuvalaisimilla, suunniteltu Anthemiuksella",
    plateCaption: ["Oleskelutila, toimistokerros", "Suunniteltu ja renderöity Anthemiuksella"],
  },
  adds: {
    h2: "Mitä {plan} lisää",
    p: "Ilmainen taso antaa suunnitella ja kokeilla rajattomasti. {plan} on hetkeen, jolloin työ lähtee asiakkaalle.",
    items: [
      { title: "Puhtaat viennit", body: "CAD-tiedostot ja piirustukset ilman vesileimaa, valmiina lähetettäväksi asiakkaalle tai urakoitsijalle." },
      { title: "3D ilman vesileimaa", body: "Esitä malli omana työnäsi, näytöllä tai jaetulla linkillä." },
      { title: "Kävelytila ja materiaalipinnat", body: "Astu tilaan lattioiden, seinien ja valaistuksen kanssa esiasetuskirjastosta." },
      { title: "Ensisijainen tuki", body: "Kysymyksiisi vastataan ensin, tuotteen tekevien ihmisten toimesta." },
    ],
  },
  month: {
    h2a: "Kuukausi riittää",
    h2b1: "",
    h2b2: "kokonaiseen projektiin.",
    quote: "”Pystyin luomaan projektin 15 minuutissa Anthemiuksella, kun siihen yleensä menee 5–7 päivää.”",
    cite: "Pratik Ghodke, varhainen käyttäjä",
    screenAlt: "Anthemius-editori: toimiston 2D-pohja vasemmalla ja sama kerros 3D:nä oikealla",
    screenCaption: "Pohja ja 3D-malli ovat yksi tiedosto. Muokkaa toista, ja toinen seuraa.",
    steps: [
      ["Suunnittele", "Piirrä pohja, tuo DXF tai luo ensimmäinen asettelu vyöhykkeistäsi."],
      ["Muokkaa", "Siirrä seinää tai vaihda huonetta. Pinta-alat, 3D-malli ja kustannukset seuraavat mukana."],
      ["Sisusta", "Lisää pinnat ja valaistus Studiossa ja aseta vuorokaudenaika."],
      ["Kävele", "Astu tilaan asiakkaasi kanssa, palaverin aikana."],
      ["Määrälaske", "Ota materiaaliluettelo ja lattiakustannus suoraan pohjasta."],
    ],
  },
  rates: {
    h2: "Sama tarjous, missä tahansa työskentelet",
    p: "Kuukausi {plan}-tasoa, hinnoiteltu markkinasi mukaan. Alueesi valitaan automaattisesti.",
    caption: "Black Friday -hinta alueittain",
    region: "Alue",
    month: "Ensimmäinen {plan}-kuukausi",
    billed: "Laskutusvaluutta",
    yours: "Sinun alueesi",
  },
  close: {
    h2a: "{price} ostaa kuukauden.",
    h2b: "Projekti jää sinulle.",
    cta: "Aloita {plan}-kuukauteni",
    termsTitle: "Tarjouksen ehdot",
    terms: [
      "Kampanjahinta koskee yhden {plan}-tilauksen ensimmäistä kuukautta tiliä kohden.",
      "Tarjous voimassa {endsOn} asti.",
      "Kampanjakuukauden jälkeen alueesi normaali kuukausihinta on voimassa, ellet peruuta ennen uusiutumista.",
    ],
  },
  dock: { suffix: "ensimmäinen {plan}-kuukausi", cta: "Aloita" },
  footer: {
    pricing: "Hinnoittelu",
    terms: "Käyttöehdot",
    privacy: "Tietosuojakäytäntö",
    copy: "© 2026 Anthemius.",
  },
  consent: {
    title: "Evästeet",
    text: "Käytämme muutamaa evästettä muistaaksemme kielesi ja valuuttasi sekä ehdottaaksemme sinulle oikeaa kieltä. Ei seurantaa, ei mainoksia.",
    accept: "Hyväksy kaikki",
    necessary: "Vain välttämättömät",
    privacy: "Tietosuojakäytäntö",
    settings: "Evästeasetukset",
  },
};
