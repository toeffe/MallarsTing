/** Pre-defined routes & machines – edit freely */

export const ROUTES = [
  {
    id: "rute-1-produktionshal-a",
    name: "Rute 1 – Produktionshal A",
    description: "Morgenrunde i pakkeområdet og linje 1–3",
    schedule: "daily",
    category: "maskiner",
    machines: [
      {
        id: "pakkemaskine-a1",
        name: "Pakkemaskine A1",
        location: "Hal A · Zone 1",
        checks: [
          {
            id: "pakninger",
            label: "Pakninger",
            image: "src/pakkemaskine-a1-pakninger.jpg"
          },
          {
            id: "remme",
            label: "Remme",
            image: "src/pakkemaskine-a1-remme.jpg"
          },
          {
            id: "sensorer-og-fotoceller",
            label: "Sensorer og fotoceller",
            image: "src/pakkemaskine-a1-sensorer-og-fotoceller.jpg"
          },
          {
            id: "noedstop-og-sikkerhed",
            label: "Nødstop og sikkerhed",
            image: "src/pakkemaskine-a1-noedstop-og-sikkerhed.jpg"
          }
        ],
        image: "src/pakkemaskine-a1.jpg"
      },
      {
        id: "transportoer-a2",
        name: "Transportør A2",
        location: "Hal A · Zone 2",
        checks: [
          {
            id: "transportbaand",
            label: "Transportbånd"
          },
          {
            id: "ruller-og-lejer",
            label: "Ruller og lejer"
          },
          {
            id: "motor-og-gear",
            label: "Motor og gear"
          }
        ]
      },
      {
        id: "etiketteringsmaskine-a3",
        name: "Etiketteringsmaskine A3",
        location: "Hal A · Zone 3",
        checks: [
          {
            id: "printdyse",
            label: "Printdyse"
          },
          {
            id: "ruller",
            label: "Ruller"
          },
          {
            id: "etiketsensor",
            label: "Etiketsensor"
          }
        ]
      }
    ]
  },
  {
    id: "rute-2-lager-og-buffer",
    name: "Rute 2 – Lager og buffer",
    description: "Ugentlig kontrol af lagerautomater",
    schedule: "weekly",
    category: "maskiner",
    machines: [
      {
        id: "lagerautomat-b1",
        name: "Lagerautomat B1",
        location: "Lager · Gang 1",
        checks: [
          {
            id: "skinner-og-vogne",
            label: "Skinner og vogne"
          },
          {
            id: "positionssensorer",
            label: "Positionssensorer"
          },
          {
            id: "doere-og-pakninger",
            label: "Døre og pakninger"
          }
        ]
      },
      {
        id: "koelebuffer-b2",
        name: "Kølebuffer B2",
        location: "Lager · Gang 2",
        checks: [
          {
            id: "temperaturvisning",
            label: "Temperaturvisning"
          },
          {
            id: "doerpakninger",
            label: "Dørpakninger"
          },
          {
            id: "ventilatorer",
            label: "Ventilatorer"
          }
        ]
      }
    ]
  },
  {
    id: "rute-3-teknikrum",
    name: "Rute 3 – Teknikrum",
    description: "Månedlig dybdekontrol af teknik",
    schedule: "monthly",
    category: "maskiner",
    machines: [
      {
        id: "kompressor-t1",
        name: "Kompressor T1",
        location: "Teknikrum",
        checks: [
          {
            id: "oliestand",
            label: "Oliestand"
          },
          {
            id: "luftfilter",
            label: "Luftfilter"
          },
          {
            id: "drivremme",
            label: "Drivremme"
          },
          {
            id: "vibration-og-stoej",
            label: "Vibration og støj"
          }
        ]
      },
      {
        id: "hydraulikaggregat-t2",
        name: "Hydraulikaggregat T2",
        location: "Teknikrum",
        checks: [
          {
            id: "olie-og-niveau",
            label: "Olie og niveau"
          },
          {
            id: "slanger-og-koblinger",
            label: "Slanger og koblinger"
          },
          {
            id: "laekager",
            label: "Lækager"
          }
        ]
      }
    ]
  },
  {
    id: "rute-4-aarlig-sikkerhed",
    name: "Rute 4 – Årlig sikkerhed",
    description: "Årlig sikkerhedsgennemgang",
    schedule: "yearly",
    category: "maskiner",
    machines: [
      {
        id: "brandslukkere-og-noedlys",
        name: "Brandslukkere og nødlys",
        location: "Hele området",
        checks: [
          {
            id: "brandslukkere",
            label: "Brandslukkere"
          },
          {
            id: "noedlys-og-skilte",
            label: "Nødlys og skilte"
          },
          {
            id: "flugtveje-frie",
            label: "Flugtveje frie"
          }
        ]
      }
    ]
  },
  {
    id: "blaa-zone-vask",
    name: "Blå zone – Vask",
    description: "Daglig rengøring af vaskelinjer og vådzone",
    schedule: "daily",
    category: "rengoring",
    machines: [
      {
        id: "vaskelinje-vest",
        name: "Vaskelinje vest",
        location: "Blå zone · venstre linje",
        checks: [
          {
            id: "gulv-og-afloeb",
            label: "Gulv og afløb"
          },
          {
            id: "vaskestationer-og-flader",
            label: "Vaskestationer og flader"
          },
          {
            id: "staenk-og-belaegning",
            label: "Stænk og belægning"
          }
        ]
      },
      {
        id: "vaskelinje-oest",
        name: "Vaskelinje øst",
        location: "Blå zone · højre linje",
        checks: [
          {
            id: "gulv-og-afloeb",
            label: "Gulv og afløb"
          },
          {
            id: "vaskestationer-og-flader",
            label: "Vaskestationer og flader"
          },
          {
            id: "riste-og-vandlaas",
            label: "Riste og vandlås"
          }
        ]
      },
      {
        id: "palleomraade",
        name: "Palleområde",
        location: "Blå zone · nordvest",
        checks: [
          {
            id: "gulv-mellem-paller",
            label: "Gulv mellem paller"
          },
          {
            id: "affald-og-spild",
            label: "Affald og spild"
          }
        ]
      }
    ],
    zoneLabel: "Blå · Vask"
  },
  {
    id: "roed-zone-produktion",
    name: "Rød zone – Produktion",
    description: "Ugentlig rengøring ved reoler, gær og maskinhal",
    schedule: "weekly",
    category: "rengoring",
    machines: [
      {
        id: "reoler-og-gangareal",
        name: "Reoler og gangareal",
        location: "Rød zone · midthal",
        checks: [
          {
            id: "gange-og-gulv",
            label: "Gange og gulv"
          },
          {
            id: "reolfoedder-og-nederste-hylder",
            label: "Reolfødder og nederste hylder"
          },
          {
            id: "hygiejnezone-ved-maskiner",
            label: "Hygiejnezone ved maskiner"
          }
        ]
      },
      {
        id: "gaerlager",
        name: "Gærlager",
        location: "Rød zone · yeast storage",
        checks: [
          {
            id: "tankfoedder-og-flader",
            label: "Tankfødder og flader"
          },
          {
            id: "gulv-og-spild",
            label: "Gulv og spild"
          },
          {
            id: "afloeb",
            label: "Afløb"
          }
        ]
      },
      {
        id: "maskinhal-oest",
        name: "Maskinhal øst",
        location: "Rød zone · højre fløj",
        checks: [
          {
            id: "gulv-omkring-maskiner",
            label: "Gulv omkring maskiner"
          },
          {
            id: "arbejdsflader",
            label: "Arbejdsflader"
          },
          {
            id: "affald-og-rester",
            label: "Affald og rester"
          }
        ]
      }
    ],
    zoneLabel: "Rød · Produktion"
  },
  {
    id: "brun-zone-toilet-og-utility",
    name: "Brun zone – Toilet og utility",
    description: "Daglig rengøring af toiletter, tankrum og lager",
    schedule: "daily",
    category: "rengoring",
    machines: [
      {
        id: "toiletter",
        name: "Toiletter",
        location: "Brun zone · vest",
        checks: [
          {
            id: "toiletter-og-skaale",
            label: "Toiletter og skåle"
          },
          {
            id: "haandvaske-og-armaturer",
            label: "Håndvaske og armaturer"
          },
          {
            id: "gulv-og-affald",
            label: "Gulv og affald"
          }
        ]
      },
      {
        id: "tankrum",
        name: "Tankrum",
        location: "Brun zone · midt",
        checks: [
          {
            id: "gulv-og-afloeb",
            label: "Gulv og afløb"
          },
          {
            id: "tankfoedder-og-laekage",
            label: "Tankfødder og lækage"
          },
          {
            id: "ingen-mad-drikke-i-zonen",
            label: "Ingen mad/drikke i zonen"
          }
        ]
      },
      {
        id: "pallelager",
        name: "Pallelager",
        location: "Brun zone · øst",
        checks: [
          {
            id: "gulv-mellem-paller",
            label: "Gulv mellem paller"
          },
          {
            id: "affald-og-stoev",
            label: "Affald og støv"
          }
        ]
      }
    ],
    zoneLabel: "Brun · Toilet/utility"
  }
];

export const STATUS = {
  OK: "ok",
  WORN: "worn",
  CRITICAL: "critical",
  DONE: "done",
  SKIP: "skip",
  ISSUE: "issue"
};

export const STATUS_LABEL = {
  ok: "OK",
  worn: "Slidt",
  critical: "Kritisk",
  done: "Udført",
  skip: "Ikke aktuelt",
  issue: "Afvigelse"
};
