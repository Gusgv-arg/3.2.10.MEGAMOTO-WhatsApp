const textoFlow1 = "¡Hola {{1}}! Para atenderte más rápido completá el formulario y un vendedor te va a estar contactando."

const flow1 = {   "version": "6.0",
  "screens": [
    {
      "id": "QUESTION_ONE",
      "title": "Marca y Modelo",
      "data": {},
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": "flow_path",
            "children": [
              {
                "type": "Dropdown",
                "label": "Motomel",
                "required": false,
                "name": "Motomel",
                "data-source": [
                  {
                      "id": "BLITZ 110 V8 START",
                      "title": "BLITZ 110 V8 START"
                  },
                  {
                      "id": "BLITZ 110 V8 BASE ONE - B1 Automatica - NEW",
                      "title": "BLITZ 110 V8 BASE ONE - B1 Automatica - NEW"
                  },
                  {
                      "id": "BLITZ 110 V8 PLUS",
                      "title": "BLITZ 110 V8 PLUS"
                  },
                  {
                      "id": "BLITZ 110 V8 FULL ONE - B1 - ALEACION DISCO - NEW",
                      "title": "BLITZ 110 V8 FULL ONE - B1 - ALEACION DISCO - NEW"
                  },
                  {
                      "id": "BLITZ 110 V8 TUNNING NEW",
                      "title": "BLITZ 110 V8 TUNNING NEW"
                  },
                  {
                      "id": "BLITZ 110 BLACK EDITION",
                      "title": "BLITZ 110 BLACK EDITION"
                  },
                  {
                      "id": "CG 150 S2 START",
                      "title": "CG 150 S2 START"
                  },
                  {
                      "id": "CG 150 S2 FULL (aleac / disco)",
                      "title": "CG 150"
                  },
                  {
                      "id": "DLX 110 DELUXE",
                      "title": "DLX 110 DELUXE"
                  },
                  {
                      "id": "MAX 110 A/E",
                      "title": "MAX 110 A/E"
                  },
                  {
                      "id": "SIRIUS 190 NUEVO PRODUCTO",
                      "title": "SIRIUS 190 NUEVO PRODUCTO"
                  },
                  {
                      "id": "SKUA 125 X-TREME",
                      "title": "SKUA 125 X-TREME"
                  },
                  {
                      "id": "SKUA 150 NEW GENERATION",
                      "title": "SKUA 150 NEW GENERATION"
                  },
                  {
                      "id": "SKUA 150 SILVER EDITION",
                      "title": "SKUA 150 SILVER EDITION"
                  },
                  {
                      "id": "SKUA 250 BASE NEW",
                      "title": "SKUA 250 BASE NEW"
                  },
                  {
                      "id": "SKUA 250 ADVENTURE NUEVO MODELO",
                      "title": "SKUA 250 ADVENTURE NUEVO MODELO"
                  },
                  {
                      "id": "STRATO 150 ALPINO",
                      "title": "STRATO 150 ALPINO"
                  },									
                  {
                      "id": "STRATO 150 EURO",
                      "title": "STRATO 150 EURO"
                  },
                  {
                      "id": "STRATO e",
                      "title": "STRATO e"
                  },
                  {
                      "id": "VICTORY 150",
                      "title": "VICTORY 150"
                  },
                  {
                      "id": "XMM 250 NUEVA",
                      "title": "XMM 250 NUEVA"
                  }
                ]
              },
              {
                "type": "Dropdown",
                "label": "Suzuki",
                "required": false,
                "name": "Suzuki",
                "data-source": [
                  {
                      "id": "AX100",
                      "title": "AX100"
                  },
                  {
                      "id": "GN125",
                      "title": "GN125"
                  },
                  {
                      "id": "GSX125",
                      "title": "GSX125"
                  },
                  {
                      "id": "GIXXER GSX 150",
                      "title": "GIXXER GSX 150"
                  }
                ]
              },
              {
                "type": "Dropdown",
                "label": "Benelli",
                "required": false,
                "name": "Benelli",
                "data-source": [
                  {
                      "id": "Leoncino 250",
                      "title": "Leoncino 250"
                  },
                  {
                      "id": "Leoncino 500 (todas AM2022)",
                      "title": "Leoncino 500 (todas AM2022)"
                  },
                  {
                      "id": "Leoncino 500 Trail",
                      "title": "Leoncino 500 Trail"
                  },
                  {
                      "id": "Leoncino 800 Trail",
                      "title": "Leoncino 800 Trail"
                  },
                  {
                      "id": "TNT 15",
                      "title": "TNT 15"
                  },
                  {
                      "id": "251S",
                      "title": "251S"
                  },
                  {
                      "id": "302S",
                      "title": "302S"
                  },
                  {
                      "id": "502 C",
                      "title": "502 C"
                  },
                  {
                      "id": "TRK251 ABS",
                      "title": "TRK251 ABS"
                  },
                  {
                      "id": "TRK502 NEW",
                      "title": "TRK502 NEW"
                  },
                  {
                      "id": "TRK502-X NEW",
                      "title": "TRK502-X NEW"
                  },
                  {
                      "id": "TNT 600i ABS nueva",
                      "title": "TNT 600i ABS nueva"
                  },
                  {
                      "id": "752S",
                      "title": "752S"
                  },
                  {
                      "id": "180 S",
                      "title": "180 S"
                  },
                  {
                      "id": "Imperiale 400",
                      "title": "Imperiale 400"
                  },                    
                  {
                      "id": "TRK 702",
                      "title": "TRK 702"
                  },                    
                  {
                      "id": "TRK 702 X",
                      "title": "TRK 702 X"
                  }
                ]
              },                
              {
                "type": "Dropdown",
                "label": "TVS",
                "required": false,
                "name": "TVS",
                "data-source": [
                  {
                      "id": "NEO XR 110",
                      "title": "NEO XR 110"
                  },
                  {
                      "id": "NTORQ 125",
                      "title": "NTORQ 125"
                  },
                  {
                      "id": "RAIDER 125",
                      "title": "RAIDER 125"
                  },
                  {
                      "id": "RTR 160",
                      "title": "RTR 160"
                  },
                  {
                      "id": "RTR 200",
                      "title": "RTR 200"
                  },
                  {
                      "id": "RTR 200 EFI 4V",
                      "title": "RTR 200 EFI 4V"
                  }
                ]
              },
              {
                "type": "Dropdown",
                "label": "Keeway",
                "required": false,
                "name": "Keeway",
                "data-source": [
                  {
                    "id": "KEEWAY K-Light 202",
                    "title": "KEEWAY K-Light 202"
                  },
                  {
                    "id": "RK 150",
                    "title": "RK 150"
                  },                    
                  {
                    "id": "V302C",
                    "title": "V302C"
                  }
                ]
              },
              {
                "type": "Dropdown",
                "label": "SYM",
                "required": false,
                "name": "SYM",
                "data-source": [
                  {
                    "id": "Citycom 300 i",
                    "title": "Citycom 300 i"
                  },
                  {
                    "id": "ORBIT II 125",
                    "title": "ORBIT II 125"
                  }
                ]
              },
              {
                "type": "Dropdown",
                "label": "Teknial eléctricas",
                "required": false,
                "name": "Teknial eléctricas",
                "data-source": [
                  {
                    "id": "TK-REVOLT",
                    "title": "TK-REVOLT"
                  },
                  {
                    "id": "TK-RERACE",
                    "title": "TK-RERACE"
                  }
                ]
              },
              {
                "type": "Dropdown",
                "label": "No sé",
                "required": false,
                "name": "No sé",
                "data-source": [{
                    "id": "No sé",
                    "title": "No sé"
                  }]
              },
              {
                "type": "Footer",
                "label": "Continuar",
                "on-click-action": {
                  "name": "navigate",
                  "next": {
                    "type": "screen",
                    "name": "screen_nfurcm"
                  },
                  "payload": {
                    "Motomel": "${form.Motomel}",
                    "Suzuki": "${form.Suzuki}",
                    "Benelli": "${form.Benelli}",
                    "TVS": "${form.TVS}",
                    "Keeway": "${form.Keeway}",
                    "SYM": "${form.SYM}",
                    "No sé":"${form.No sé}",
                    "Teknial eléctricas":"${form.Teknial eléctricas}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      "id": "screen_nfurcm",
      "title": "Método de Pago",
      "data": {
        "Motomel": {
          "type": "string",
          "__example__": "Example"
        },
        "Suzuki": {
          "type": "string",
          "__example__": "Example"
        },
        "Benelli": {
          "type": "string",
          "__example__": "Example"
        },
        "Keeway": {
          "type": "string",
          "__example__": "Example"
        },
        "SYM": {
          "type": "string",
          "__example__": "Example"
        },
        "TVS": {
          "type": "string",
          "__example__": "Example"
        },
        "No sé": {
          "type": "string",
          "__example__": "Example"
        },
        "Teknial eléctricas": {
          "type": "string",
          "__example__": "Example"
        }
      },
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": "flow_path",
            "children": [
              {
                "type": "CheckboxGroup",
                "label": "Seleccionar lo que corresponda",
                "required": true,
                "name": "Seleccionar lo que corresponda",
                "data-source": [
                  {
                    "id": "Efectivo, Transferencia o Tarjeta de Débito",
                    "title": "Efectivo, Transferencia o Tarjeta de Débito"
                  },
                  {
                    "id": "Tarjeta de Crédito",
                    "title": "Tarjeta de Crédito"
                  },
                  {
                    "id": "Préstamo Personal",
                    "title": "Préstamo Personal"
                  },                    
                  {
                    "id": "Préstamo Prendario",
                    "title": "Préstamo Prendario"
                  }
                ]
              },
              {
                "type": "Footer",
                "label": "Continuar",
                "on-click-action": {
                  "name": "navigate",
                  "next": {
                    "type": "screen",
                    "name": "screen_xvbvvl"
                  },
                  "payload": {
                    "Seleccionar lo que corresponda": "${form.Seleccionar lo que corresponda}",
                    "Motomel": "${data.Motomel}",
                    "Suzuki": "${data.Suzuki}",
                    "Benelli": "${data.Benelli}",
                    "Keeway": "${data.Keeway}",
                    "SYM": "${data.SYM}",
                    "TVS": "${data.TVS}",
                    "No sé": "${data.No sé}",
                    "Teknial eléctricas": "${data.Teknial eléctricas}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      "id": "screen_xvbvvl",
      "title": "Documento",
      "data": {
        "Seleccionar lo que corresponda": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "__example__": []
        },
        "Motomel": {
          "type": "string",
          "__example__": "Example"
        },
        "Suzuki": {
          "type": "string",
          "__example__": "Example"
        },
        "Benelli": {
          "type": "string",
          "__example__": "Example"
        },
        "Keeway": {
          "type": "string",
          "__example__": "Example"
        },
        "SYM": {
          "type": "string",
          "__example__": "Example"
        },
        "TVS": {
          "type": "string",
          "__example__": "Example"
        },
        "No sé": {
          "type": "string",
          "__example__": "Example"
        },
        "Teknial eléctricas": {
          "type": "string",
          "__example__": "Example"
        }
      },
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": "flow_path",
            "children": [
              {
                "type": "TextBody",
                "text": "Si va a solicitar un Préstamo informe su DNI"
              },
              {
                "type": "TextInput",
                "name": "DNI",
                "label": "DNI",
                "required": false,
                "input-type": "number",
                "helper-text": "Completar si va a solicitar un Préstamo"
              },
              {
                "type": "Footer",
                "label": "Continuar",
                "on-click-action": {
                  "name": "navigate",
                  "next": {
                    "type": "screen",
                    "name": "screen_hedboy"
                  },
                  "payload": {
                    "DNI": "${form.DNI}",
                    "Seleccionar lo que corresponda": "${data.Seleccionar lo que corresponda}",
                    "Motomel": "${data.Motomel}",
                    "Suzuki": "${data.Suzuki}",
                    "Benelli": "${data.Benelli}",
                    "Keeway": "${data.Keeway}",
                    "SYM": "${data.SYM}",
                    "TVS": "${data.TVS}",
                    "No sé": "${data.No sé}",
                    "Teknial eléctricas": "${data.Teknial eléctricas}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      "id": "screen_hedboy",
      "title": "Preguntas",
      "data": {
        "DNI": {
          "type": "string",
          "__example__": "Example"
        },
        "Seleccionar lo que corresponda": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "__example__": []
        },
        "Motomel": {
          "type": "string",
          "__example__": "Example"
        },
        "Suzuki": {
          "type": "string",
          "__example__": "Example"
        },
        "Benelli": {
          "type": "string",
          "__example__": "Example"
        },
        "Keeway": {
          "type": "string",
          "__example__": "Example"
        },
        "SYM": {
          "type": "string",
          "__example__": "Example"
        },
        "TVS": {
          "type": "string",
          "__example__": "Example"
        },
        "No sé": {
          "type": "string",
          "__example__": "Example"
        },
        "Teknial eléctricas": {
          "type": "string",
          "__example__": "Example"
        }
      },
      "terminal": true,
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": "flow_path",
            "children": [
              {
                "type": "TextArea",
                "label": "Preguntas",
                "required": false,
                "name": "Preguntas",
                "helper-text": "Puede preguntar por ejemplo por otro modelo de una misma marca"
              },
              {
                "type": "Footer",
                "label": "Enviar",
                "on-click-action": {
                  "name": "complete",
                  "payload": {
                    "Preguntas": "${form.Preguntas}",
                    "DNI": "${data.DNI}",
                    "Seleccionar lo que corresponda": "${data.Seleccionar lo que corresponda}",
                    "Motomel": "${data.Motomel}",
                    "Suzuki": "${data.Suzuki}",
                    "Benelli": "${data.Benelli}",
                    "Keeway": "${data.Keeway}",
                    "SYM": "${data.SYM}",
                    "TVS": "${data.TVS}",
                    "No sé":"${data.No sé}",
                    "Teknial": "${data.Teknial eléctricas}"
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ]
}

const flow2= {
  "version": "6.0",
  "screens": [
    {
      "id": "QUESTION_ONE",
      "title": "Atención del Lead",
      "data": {},
      "terminal": true,
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": "flow_path",
            "children": [
              {
                "type": "RadioButtonsGroup",
                "label": "Tomar Lead",
                "required": false,
                "name": "Tomar Lead",
                "data-source": [
                  {
                    "id": "Atender",
                    "title": "Atender"
                  },
                  {
                    "id": "Atender más tarde",
                    "title": "Atender más tarde"
                  }
                ]
              },
              {
                "type": "RadioButtonsGroup",
                "label": "Derivar Lead",
                "required": false,
                "name": "Derivar Lead",
                "data-source": [
                  {
                    "id": "Gustavo Glunz",
                    "title": "Gustavo Glunz"
                  },
                  {
                    "id": "Gustavo Gómez Villafañe",
                    "title": "Gustavo Gómez Villafañe"
                  }
                ]
              },
              {
                "type": "TextArea",
                "label": "Notas sobre el lead",
                "required": false,
                "name": "Notas sobre el lead"
              },
              {
                "type": "Footer",
                "label": "Enviar",
                "on-click-action": {
                  "name": "complete",
                  "payload": {
                    "Tomar Lead": "${form.Tomar Lead}",
                    "Derivar Lead": "${form.Derivar Lead}",
                    "Notas sobre el lead": "${form.Notas sobre el lead}"
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ]
}