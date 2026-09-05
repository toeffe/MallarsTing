/** Pre-defined routes & machines – edit freely */

export const ROUTES = [
  {
    id: "route-1",
    name: "Rute 1 – Produktionshal A",
    description: "Morgenrunde i pakkeområdet og linje 1–3",
    schedule: "daily",
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
];

export const STATUS = {
  OK: "ok",
  WORN: "worn",
  CRITICAL: "critical",
};

export const STATUS_LABEL = {
  ok: "OK",
  worn: "Slidt",
  critical: "Kritisk",
};
