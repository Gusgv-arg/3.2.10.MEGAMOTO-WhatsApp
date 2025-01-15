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
                "name": "Motomel_16449a",
                "data-source": [
                  {
                      "id": "Blitz 110",
                      "title": "Blitz 110"
                  },
                  {
                      "id": "CG 150",
                      "title": "CG 150"
                  },
                  {
                      "id": "DLX 110",
                      "title": "DLX 110"
                  },
                  {
                      "id": "MAX 110",
                      "title": "MAX 110"
                  },
                  {
                      "id": "SIRIUS 190",
                      "title": "SIRIUS 190"
                  },
                  {
                      "id": "SKUA 125",
                      "title": "SKUA 125"
                  },
                  {
                      "id": "SKUA 150",
                      "title": "SKUA 150"
                  },
                  {
                      "id": "SKUA 250",
                      "title": "SKUA 250"
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
                "name": "Suzuki_939cbe",
                "data-source": [
                  {
                      "id": "AX 100",
                      "title": "AX 100"
                  },
                  {
                      "id": "GN 125",
                      "title": "GN 125"
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
                "name": "Benelli_731fad",
                "data-source": [
                  {
                      "id": "Leoncino 250",
                      "title": "Leoncino 250"
                  },
                  {
                      "id": "Leoncino 500 (todas AM 2022)",
                      "title": "Leoncino 500 (todas AM 2022)"
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
                      "id": "251 S",
                      "title": "251 S"
                  },
                  {
                      "id": "502 C",
                      "title": "502 C"
                  },
                  {
                      "id": "TRK 251 ABS",
                      "title": "TRK 251 ABS"
                  },
                  {
                      "id": "TRK 502 NEW",
                      "title": "TRK 502 NEW"
                  },
                  {
                      "id": "TRK 502 X NEW",
                      "title": "TRK 502 X NEW"
                  },
                  {
                      "id": "TNT 600i ABS nueva",
                      "title": "TNT 600i ABS nueva"
                  },
                  {
                      "id": "752 S",
                      "title": "752 S"
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
                "name": "Keeway_915524",
                "data-source": [
                  {
                    "id": "K-Light 202",
                    "title": "K-Light 202"
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
                "name": "SYM_69580a",
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
                "label": "Teknial motos eléctricas",
                "required": false,
                "name": "Teknial motos eléctricas",
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
                    "Motomel": "${form.Motomel_16449a}",
                    "Suzuki": "${form.Suzuki_939cbe}",
                    "Benelli": "${form.Benelli_731fad}",
                    "TVS": "${form.TVS}",
                    "Keeway": "${form.Keeway_915524}",
                    "SYM": "${form.SYM_69580a}",
                    "No sé":"${form.No sé}",
                    "Teknial motos eléctricas":"${form.Teknial motos eléctricas}"
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
        "Teknial motos eléctricas": {
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
                "name": "Seleccionar_lo_que_corresponda_ffc531",
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
                    "Seleccionar lo que corresponda": "${form.Seleccionar_lo_que_corresponda_ffc531}",
                    "Motomel": "${data.Motomel}",
                    "Suzuki": "${data.Suzuki}",
                    "Benelli": "${data.Benelli}",
                    "Keeway": "${data.Keeway}",
                    "SYM": "${data.SYM}",
                    "TVS": "${data.TVS}",
                    "No sé": "${data.No sé}",
                    "Teknial motos eléctricas": "${data.Teknial motos eléctricas}"
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
        "Teknial motos eléctricas": {
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
                "name": "DNI_b16fd8",
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
                    "DNI": "${form.DNI_b16fd8}",
                    "Seleccionar lo que corresponda": "${data.Seleccionar lo que corresponda}",
                    "Motomel": "${data.Motomel}",
                    "Suzuki": "${data.Suzuki}",
                    "Benelli": "${data.Benelli}",
                    "Keeway": "${data.Keeway}",
                    "SYM": "${data.SYM}",
                    "TVS": "${data.TVS}",
                    "No sé": "${data.No sé}",
                    "Teknial motos eléctricas": "${data.Teknial motos eléctricas}"
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
        "Teknial motos eléctricas": {
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
                "name": "Preguntas_df18e9",
                "helper-text": "Puede preguntar por ejemplo por otro modelo de una misma marca"
              },
              {
                "type": "Footer",
                "label": "Enviar",
                "on-click-action": {
                  "name": "complete",
                  "payload": {
                    "Preguntas": "${form.Preguntas_df18e9}",
                    "DNI": "${data.DNI}",
                    "Seleccionar lo que corresponda": "${data.Seleccionar lo que corresponda}",
                    "Motomel": "${data.Motomel}",
                    "Suzuki": "${data.Suzuki}",
                    "Benelli": "${data.Benelli}",
                    "Keeway": "${data.Keeway}",
                    "SYM": "${data.SYM}",
                    "TVS": "${data.TVS}",
                    "No sé":"${data.No sé}",
                    "Teknial": "${data.Teknial motos eléctricas}"
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