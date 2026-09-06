// Builtin Mallars Ting kontroller — generated from src/data.js via convertLegacyRoute.
// Regenerate: node scripts/gen-seed.mjs
export const SEED_TEMPLATES = [
  {
    "referenceId": "rute-1-produktionshal-a",
    "name": "Rute 1 – Produktionshal A",
    "description": "Morgenrunde i pakkeområdet og linje 1–3",
    "category": "maskiner",
    "schedule": "daily",
    "zoneLabel": "",
    "executionView": "begge",
    "version": 1,
    "updatedAt": "2026-09-06T14:57:55.849Z",
    "publishedAt": "2026-09-06T14:57:55.849Z",
    "builtin": true,
    "embeddedAnswerSets": {
      "tilstand": {
        "id": "tilstand",
        "name": "Tilstand",
        "options": [
          {
            "id": "ok",
            "label": "OK"
          },
          {
            "id": "slidt",
            "label": "Slidt"
          },
          {
            "id": "kritisk",
            "label": "Kritisk"
          }
        ],
        "defaultOptionIds": []
      }
    },
    "groups": [
      {
        "id": "pakkemaskine-a1",
        "name": "Pakkemaskine A1",
        "location": "Hal A · Zone 1",
        "image": "src/pakkemaskine-a1.jpg",
        "points": [
          {
            "id": "pakninger",
            "label": "Pakninger",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-1",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-2",
                    "type": "reference_image",
                    "label": "Reference",
                    "required": false,
                    "config": {
                      "src": "src/pakkemaskine-a1-pakninger.jpg"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-3",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-4",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-5",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-6",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-7",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-8",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "remme",
            "label": "Remme",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-9",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-10",
                    "type": "reference_image",
                    "label": "Reference",
                    "required": false,
                    "config": {
                      "src": "src/pakkemaskine-a1-remme.jpg"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-11",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-12",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-13",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-14",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-15",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-16",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "sensorer-og-fotoceller",
            "label": "Sensorer og fotoceller",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-17",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-18",
                    "type": "reference_image",
                    "label": "Reference",
                    "required": false,
                    "config": {
                      "src": "src/pakkemaskine-a1-sensorer-og-fotoceller.jpg"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-19",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-20",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-21",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-22",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-23",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-24",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "noedstop-og-sikkerhed",
            "label": "Nødstop og sikkerhed",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-25",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-26",
                    "type": "reference_image",
                    "label": "Reference",
                    "required": false,
                    "config": {
                      "src": "src/pakkemaskine-a1-noedstop-og-sikkerhed.jpg"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-27",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-28",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-29",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-30",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-31",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-32",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "transportoer-a2",
        "name": "Transportør A2",
        "location": "Hal A · Zone 2",
        "image": "",
        "points": [
          {
            "id": "transportbaand",
            "label": "Transportbånd",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-33",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-34",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-35",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-36",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-37",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-38",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "ruller-og-lejer",
            "label": "Ruller og lejer",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-39",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-40",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-41",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-42",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-43",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-44",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "motor-og-gear",
            "label": "Motor og gear",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-45",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-46",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-47",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-48",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-49",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-50",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "etiketteringsmaskine-a3",
        "name": "Etiketteringsmaskine A3",
        "location": "Hal A · Zone 3",
        "image": "",
        "points": [
          {
            "id": "printdyse",
            "label": "Printdyse",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-51",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-52",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-53",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-54",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-55",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-56",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "ruller",
            "label": "Ruller",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-57",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-58",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-59",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-60",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-61",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-62",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "etiketsensor",
            "label": "Etiketsensor",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-63",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-64",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-65",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-66",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-67",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-68",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "referenceId": "rute-2-lager-og-buffer",
    "name": "Rute 2 – Lager og buffer",
    "description": "Ugentlig kontrol af lagerautomater",
    "category": "maskiner",
    "schedule": "weekly",
    "zoneLabel": "",
    "executionView": "begge",
    "version": 1,
    "updatedAt": "2026-09-06T14:57:55.850Z",
    "publishedAt": "2026-09-06T14:57:55.850Z",
    "builtin": true,
    "embeddedAnswerSets": {
      "tilstand": {
        "id": "tilstand",
        "name": "Tilstand",
        "options": [
          {
            "id": "ok",
            "label": "OK"
          },
          {
            "id": "slidt",
            "label": "Slidt"
          },
          {
            "id": "kritisk",
            "label": "Kritisk"
          }
        ],
        "defaultOptionIds": []
      }
    },
    "groups": [
      {
        "id": "lagerautomat-b1",
        "name": "Lagerautomat B1",
        "location": "Lager · Gang 1",
        "image": "",
        "points": [
          {
            "id": "skinner-og-vogne",
            "label": "Skinner og vogne",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-69",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-70",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-71",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-72",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-73",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-74",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "positionssensorer",
            "label": "Positionssensorer",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-75",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-76",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-77",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-78",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-79",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-80",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "doere-og-pakninger",
            "label": "Døre og pakninger",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-81",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-82",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-83",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-84",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-85",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-86",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "koelebuffer-b2",
        "name": "Kølebuffer B2",
        "location": "Lager · Gang 2",
        "image": "",
        "points": [
          {
            "id": "temperaturvisning",
            "label": "Temperaturvisning",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-87",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-88",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-89",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-90",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-91",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-92",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "doerpakninger",
            "label": "Dørpakninger",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-93",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-94",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-95",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-96",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-97",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-98",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "ventilatorer",
            "label": "Ventilatorer",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-99",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-100",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-101",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-102",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-103",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-104",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "referenceId": "rute-3-teknikrum",
    "name": "Rute 3 – Teknikrum",
    "description": "Månedlig dybdekontrol af teknik",
    "category": "maskiner",
    "schedule": "monthly",
    "zoneLabel": "",
    "executionView": "begge",
    "version": 1,
    "updatedAt": "2026-09-06T14:57:55.850Z",
    "publishedAt": "2026-09-06T14:57:55.850Z",
    "builtin": true,
    "embeddedAnswerSets": {
      "tilstand": {
        "id": "tilstand",
        "name": "Tilstand",
        "options": [
          {
            "id": "ok",
            "label": "OK"
          },
          {
            "id": "slidt",
            "label": "Slidt"
          },
          {
            "id": "kritisk",
            "label": "Kritisk"
          }
        ],
        "defaultOptionIds": []
      }
    },
    "groups": [
      {
        "id": "kompressor-t1",
        "name": "Kompressor T1",
        "location": "Teknikrum",
        "image": "",
        "points": [
          {
            "id": "oliestand",
            "label": "Oliestand",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-105",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-106",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-107",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-108",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-109",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-110",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "luftfilter",
            "label": "Luftfilter",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-111",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-112",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-113",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-114",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-115",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-116",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "drivremme",
            "label": "Drivremme",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-117",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-118",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-119",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-120",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-121",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-122",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "vibration-og-stoej",
            "label": "Vibration og støj",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-123",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-124",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-125",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-126",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-127",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-128",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "hydraulikaggregat-t2",
        "name": "Hydraulikaggregat T2",
        "location": "Teknikrum",
        "image": "",
        "points": [
          {
            "id": "olie-og-niveau",
            "label": "Olie og niveau",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-129",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-130",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-131",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-132",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-133",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-134",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "slanger-og-koblinger",
            "label": "Slanger og koblinger",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-135",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-136",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-137",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-138",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-139",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-140",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "laekager",
            "label": "Lækager",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-141",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-142",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-143",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-144",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-145",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-146",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "referenceId": "rute-4-aarlig-sikkerhed",
    "name": "Rute 4 – Årlig sikkerhed",
    "description": "Årlig sikkerhedsgennemgang",
    "category": "maskiner",
    "schedule": "yearly",
    "zoneLabel": "",
    "executionView": "begge",
    "version": 1,
    "updatedAt": "2026-09-06T14:57:55.850Z",
    "publishedAt": "2026-09-06T14:57:55.850Z",
    "builtin": true,
    "embeddedAnswerSets": {
      "tilstand": {
        "id": "tilstand",
        "name": "Tilstand",
        "options": [
          {
            "id": "ok",
            "label": "OK"
          },
          {
            "id": "slidt",
            "label": "Slidt"
          },
          {
            "id": "kritisk",
            "label": "Kritisk"
          }
        ],
        "defaultOptionIds": []
      }
    },
    "groups": [
      {
        "id": "brandslukkere-og-noedlys",
        "name": "Brandslukkere og nødlys",
        "location": "Hele området",
        "image": "",
        "points": [
          {
            "id": "brandslukkere",
            "label": "Brandslukkere",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-147",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-148",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-149",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-150",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-151",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-152",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "noedlys-og-skilte",
            "label": "Nødlys og skilte",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-153",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-154",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-155",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-156",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-157",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-158",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "flugtveje-frie",
            "label": "Flugtveje frie",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-159",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-160",
                    "type": "single_choice",
                    "label": "Tilstand",
                    "required": true,
                    "config": {
                      "answerSetId": "tilstand"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-161",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-162",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": true,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-163",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-164",
                    "type": "photo",
                    "label": "Foto",
                    "required": true,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "referenceId": "blaa-zone-vask",
    "name": "Blå zone – Vask",
    "description": "Daglig rengøring af vaskelinjer og vådzone",
    "category": "rengoring",
    "schedule": "daily",
    "zoneLabel": "Blå · Vask",
    "executionView": "begge",
    "version": 1,
    "updatedAt": "2026-09-06T14:57:55.850Z",
    "publishedAt": "2026-09-06T14:57:55.850Z",
    "builtin": true,
    "embeddedAnswerSets": {
      "rengoring-status": {
        "id": "rengoring-status",
        "name": "Rengøring-status",
        "options": [
          {
            "id": "udfort",
            "label": "Udført"
          },
          {
            "id": "ikke-aktuelt",
            "label": "Ikke aktuelt"
          },
          {
            "id": "afvigelse",
            "label": "Afvigelse"
          }
        ],
        "defaultOptionIds": []
      }
    },
    "groups": [
      {
        "id": "vaskelinje-vest",
        "name": "Vaskelinje vest",
        "location": "Blå zone · venstre linje",
        "image": "",
        "points": [
          {
            "id": "gulv-og-afloeb",
            "label": "Gulv og afløb",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-165",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-166",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-167",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-168",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-169",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-170",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "vaskestationer-og-flader",
            "label": "Vaskestationer og flader",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-171",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-172",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-173",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-174",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-175",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-176",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "staenk-og-belaegning",
            "label": "Stænk og belægning",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-177",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-178",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-179",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-180",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-181",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-182",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "vaskelinje-oest",
        "name": "Vaskelinje øst",
        "location": "Blå zone · højre linje",
        "image": "",
        "points": [
          {
            "id": "gulv-og-afloeb",
            "label": "Gulv og afløb",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-183",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-184",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-185",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-186",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-187",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-188",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "vaskestationer-og-flader",
            "label": "Vaskestationer og flader",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-189",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-190",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-191",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-192",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-193",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-194",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "riste-og-vandlaas",
            "label": "Riste og vandlås",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-195",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-196",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-197",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-198",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-199",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-200",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "palleomraade",
        "name": "Palleområde",
        "location": "Blå zone · nordvest",
        "image": "",
        "points": [
          {
            "id": "gulv-mellem-paller",
            "label": "Gulv mellem paller",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-201",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-202",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-203",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-204",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-205",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-206",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "affald-og-spild",
            "label": "Affald og spild",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-207",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-208",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-209",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-210",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-211",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-212",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "referenceId": "roed-zone-produktion",
    "name": "Rød zone – Produktion",
    "description": "Ugentlig rengøring ved reoler, gær og maskinhal",
    "category": "rengoring",
    "schedule": "weekly",
    "zoneLabel": "Rød · Produktion",
    "executionView": "begge",
    "version": 1,
    "updatedAt": "2026-09-06T14:57:55.850Z",
    "publishedAt": "2026-09-06T14:57:55.850Z",
    "builtin": true,
    "embeddedAnswerSets": {
      "rengoring-status": {
        "id": "rengoring-status",
        "name": "Rengøring-status",
        "options": [
          {
            "id": "udfort",
            "label": "Udført"
          },
          {
            "id": "ikke-aktuelt",
            "label": "Ikke aktuelt"
          },
          {
            "id": "afvigelse",
            "label": "Afvigelse"
          }
        ],
        "defaultOptionIds": []
      }
    },
    "groups": [
      {
        "id": "reoler-og-gangareal",
        "name": "Reoler og gangareal",
        "location": "Rød zone · midthal",
        "image": "",
        "points": [
          {
            "id": "gange-og-gulv",
            "label": "Gange og gulv",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-213",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-214",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-215",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-216",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-217",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-218",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "reolfoedder-og-nederste-hylder",
            "label": "Reolfødder og nederste hylder",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-219",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-220",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-221",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-222",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-223",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-224",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "hygiejnezone-ved-maskiner",
            "label": "Hygiejnezone ved maskiner",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-225",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-226",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-227",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-228",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-229",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-230",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "gaerlager",
        "name": "Gærlager",
        "location": "Rød zone · yeast storage",
        "image": "",
        "points": [
          {
            "id": "tankfoedder-og-flader",
            "label": "Tankfødder og flader",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-231",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-232",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-233",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-234",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-235",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-236",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "gulv-og-spild",
            "label": "Gulv og spild",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-237",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-238",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-239",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-240",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-241",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-242",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "afloeb",
            "label": "Afløb",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-243",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-244",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-245",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-246",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-247",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-248",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "maskinhal-oest",
        "name": "Maskinhal øst",
        "location": "Rød zone · højre fløj",
        "image": "",
        "points": [
          {
            "id": "gulv-omkring-maskiner",
            "label": "Gulv omkring maskiner",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-249",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-250",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-251",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-252",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-253",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-254",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "arbejdsflader",
            "label": "Arbejdsflader",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-255",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-256",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-257",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-258",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-259",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-260",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "affald-og-rester",
            "label": "Affald og rester",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-261",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-262",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-263",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-264",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-265",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-266",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "referenceId": "brun-zone-toilet-og-utility",
    "name": "Brun zone – Toilet og utility",
    "description": "Daglig rengøring af toiletter, tankrum og lager",
    "category": "rengoring",
    "schedule": "daily",
    "zoneLabel": "Brun · Toilet/utility",
    "executionView": "begge",
    "version": 1,
    "updatedAt": "2026-09-06T14:57:55.850Z",
    "publishedAt": "2026-09-06T14:57:55.850Z",
    "builtin": true,
    "embeddedAnswerSets": {
      "rengoring-status": {
        "id": "rengoring-status",
        "name": "Rengøring-status",
        "options": [
          {
            "id": "udfort",
            "label": "Udført"
          },
          {
            "id": "ikke-aktuelt",
            "label": "Ikke aktuelt"
          },
          {
            "id": "afvigelse",
            "label": "Afvigelse"
          }
        ],
        "defaultOptionIds": []
      }
    },
    "groups": [
      {
        "id": "toiletter",
        "name": "Toiletter",
        "location": "Brun zone · vest",
        "image": "",
        "points": [
          {
            "id": "toiletter-og-skaale",
            "label": "Toiletter og skåle",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-267",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-268",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-269",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-270",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-271",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-272",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "haandvaske-og-armaturer",
            "label": "Håndvaske og armaturer",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-273",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-274",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-275",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-276",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-277",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-278",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "gulv-og-affald",
            "label": "Gulv og affald",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-279",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-280",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-281",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-282",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-283",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-284",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "tankrum",
        "name": "Tankrum",
        "location": "Brun zone · midt",
        "image": "",
        "points": [
          {
            "id": "gulv-og-afloeb",
            "label": "Gulv og afløb",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-285",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-286",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-287",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-288",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-289",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-290",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "tankfoedder-og-laekage",
            "label": "Tankfødder og lækage",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-291",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-292",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-293",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-294",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-295",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-296",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "ingen-mad-drikke-i-zonen",
            "label": "Ingen mad/drikke i zonen",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-297",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-298",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-299",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-300",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-301",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-302",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "pallelager",
        "name": "Pallelager",
        "location": "Brun zone · øst",
        "image": "",
        "points": [
          {
            "id": "gulv-mellem-paller",
            "label": "Gulv mellem paller",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-303",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-304",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-305",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-306",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-307",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-308",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "affald-og-stoev",
            "label": "Affald og støv",
            "rows": [
              {
                "id": "raekke-mtpxrs7e-309",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-310",
                    "type": "single_choice",
                    "label": "Status",
                    "required": true,
                    "config": {
                      "answerSetId": "rengoring-status"
                    }
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-311",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-312",
                    "type": "comment",
                    "label": "Kommentar",
                    "required": false,
                    "config": {}
                  }
                ]
              },
              {
                "id": "raekke-mtpxrs7e-313",
                "columns": 1,
                "fields": [
                  {
                    "id": "felt-mtpxrs7e-314",
                    "type": "photo",
                    "label": "Foto",
                    "required": false,
                    "config": {
                      "source": "both",
                      "multiple": false
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
