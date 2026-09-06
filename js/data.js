/** Pre-defined routes & machines – edit freely */

export const ROUTES = [
  {
    id: "route-1",
    name: "Rute 1 – Produktionshal A",
    description: "Morgenrunde i pakkeområdet og linje 1–3",
    schedule: "daily",
    category: "maskiner",
    machines: [
      {
        id: "A1",
        name: "Pakkemaskine A1",
        location: "Hal A · Zone 1",
        checks: [
          { id: "gasket", label: "Pakninger" },
          { id: "belt", label: "Remme" },
          { id: "sensors", label: "Sensorer og fotoceller" },
          { id: "safety", label: "Nødstop og sikkerhed" },
        ],
      },
      {
        id: "A2",
        name: "Transportør A2",
        location: "Hal A · Zone 2",
        checks: [
          { id: "belt", label: "Transportbånd" },
          { id: "rollers", label: "Ruller og lejer" },
          { id: "motor", label: "Motor og gear" },
        ],
      },
      {
        id: "A3",
        name: "Etiketteringsmaskine A3",
        location: "Hal A · Zone 3",
        checks: [
          { id: "printhead", label: "Printdyse" },
          { id: "rollers", label: "Ruller" },
          { id: "sensors", label: "Etiketsensor" },
        ],
      },
    ],
  },
  {
    id: "route-2",
    name: "Rute 2 – Lager og buffer",
    description: "Ugentlig kontrol af lagerautomater",
    schedule: "weekly",
    category: "maskiner",
    machines: [
      {
        id: "B1",
        name: "Lagerautomat B1",
        location: "Lager · Gang 1",
        checks: [
          { id: "rails", label: "Skinner og vogne" },
          { id: "sensors", label: "Positionssensorer" },
          { id: "door", label: "Døre og pakninger" },
        ],
      },
      {
        id: "B2",
        name: "Kølebuffer B2",
        location: "Lager · Gang 2",
        checks: [
          { id: "temp", label: "Temperaturvisning" },
          { id: "gasket", label: "Dørpakninger" },
          { id: "fan", label: "Ventilatorer" },
        ],
      },
    ],
  },
  {
    id: "route-3",
    name: "Rute 3 – Teknikrum",
    description: "Månedlig dybdekontrol af teknik",
    schedule: "monthly",
    category: "maskiner",
    machines: [
      {
        id: "T1",
        name: "Kompressor T1",
        location: "Teknikrum",
        checks: [
          { id: "oil", label: "Oliestand" },
          { id: "filter", label: "Luftfilter" },
          { id: "belts", label: "Drivremme" },
          { id: "vibration", label: "Vibration og støj" },
        ],
      },
      {
        id: "T2",
        name: "Hydraulikaggregat T2",
        location: "Teknikrum",
        checks: [
          { id: "oil", label: "Olie og niveau" },
          { id: "hoses", label: "Slanger og koblinger" },
          { id: "leaks", label: "Lækager" },
        ],
      },
    ],
  },
  {
    id: "route-4",
    name: "Rute 4 – Årlig sikkerhed",
    description: "Årlig sikkerhedsgennemgang",
    schedule: "yearly",
    category: "maskiner",
    machines: [
      {
        id: "S1",
        name: "Brandslukkere og nødlys",
        location: "Hele området",
        checks: [
          { id: "extinguishers", label: "Brandslukkere" },
          { id: "emergency", label: "Nødlys og skilte" },
          { id: "exits", label: "Flugtveje frie" },
        ],
      },
    ],
  },
  {
    id: "clean-blue",
    name: "Blå zone – Vask",
    description: "Daglig rengøring af vaskelinjer og vådzone",
    schedule: "daily",
    category: "rengoring",
    zoneLabel: "Blå · Vask",
    machines: [
      {
        id: "C-BL-1",
        name: "Vaskelinje vest",
        location: "Blå zone · venstre linje",
        checks: [
          { id: "floor", label: "Gulv og afløb" },
          { id: "stations", label: "Vaskestationer og flader" },
          { id: "splash", label: "Stænk og belægning" },
        ],
      },
      {
        id: "C-BL-2",
        name: "Vaskelinje øst",
        location: "Blå zone · højre linje",
        checks: [
          { id: "floor", label: "Gulv og afløb" },
          { id: "stations", label: "Vaskestationer og flader" },
          { id: "drains", label: "Riste og vandlås" },
        ],
      },
      {
        id: "C-BL-3",
        name: "Palleområde",
        location: "Blå zone · nordvest",
        checks: [
          { id: "floor", label: "Gulv mellem paller" },
          { id: "waste", label: "Affald og spild" },
        ],
      },
    ],
  },
  {
    id: "clean-red",
    name: "Rød zone – Produktion",
    description: "Ugentlig rengøring ved reoler, gær og maskinhal",
    schedule: "weekly",
    category: "rengoring",
    zoneLabel: "Rød · Produktion",
    machines: [
      {
        id: "C-RD-1",
        name: "Reoler og gangareal",
        location: "Rød zone · midthal",
        checks: [
          { id: "aisles", label: "Gange og gulv" },
          { id: "racks", label: "Reolfødder og nederste hylder" },
          { id: "hygiene", label: "Hygiejnezone ved maskiner" },
        ],
      },
      {
        id: "C-RD-2",
        name: "Gærlager",
        location: "Rød zone · yeast storage",
        checks: [
          { id: "tanks", label: "Tankfødder og flader" },
          { id: "floor", label: "Gulv og spild" },
          { id: "drains", label: "Afløb" },
        ],
      },
      {
        id: "C-RD-3",
        name: "Maskinhal øst",
        location: "Rød zone · højre fløj",
        checks: [
          { id: "floor", label: "Gulv omkring maskiner" },
          { id: "surfaces", label: "Arbejdsflader" },
          { id: "waste", label: "Affald og rester" },
        ],
      },
    ],
  },
  {
    id: "clean-tan",
    name: "Brun zone – Toilet og utility",
    description: "Daglig rengøring af toiletter, tankrum og lager",
    schedule: "daily",
    category: "rengoring",
    zoneLabel: "Brun · Toilet/utility",
    machines: [
      {
        id: "C-TN-1",
        name: "Toiletter",
        location: "Brun zone · vest",
        checks: [
          { id: "toilets", label: "Toiletter og skåle" },
          { id: "sinks", label: "Håndvaske og armaturer" },
          { id: "floor", label: "Gulv og affald" },
        ],
      },
      {
        id: "C-TN-2",
        name: "Tankrum",
        location: "Brun zone · midt",
        checks: [
          { id: "floor", label: "Gulv og afløb" },
          { id: "tanks", label: "Tankfødder og lækage" },
          { id: "hygiene", label: "Ingen mad/drikke i zonen" },
        ],
      },
      {
        id: "C-TN-3",
        name: "Pallelager",
        location: "Brun zone · øst",
        checks: [
          { id: "floor", label: "Gulv mellem paller" },
          { id: "waste", label: "Affald og støv" },
        ],
      },
    ],
  },
];

export const STATUS = {
  OK: "ok",
  WORN: "worn",
  CRITICAL: "critical",
  DONE: "done",
  SKIP: "skip",
  ISSUE: "issue",
};

export const STATUS_LABEL = {
  ok: "OK",
  worn: "Slidt",
  critical: "Kritisk",
  done: "Udført",
  skip: "Ikke aktuelt",
  issue: "Afvigelse",
};
