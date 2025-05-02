import Leads from "../../models/leads.js";

// Función que trae todo los Leads disponibles para atender
export const findFlowLeadsForVendors = async () => {

	// Crear fechas en UTC y ajustarlas a Argentina (UTC-3).
    const currentDateUTC = new Date();
    const currentDate = new Date(currentDateUTC.getTime() - (3 * 60 * 60 * 1000));
    const twentyFourHoursAgo = new Date(currentDate - 24 * 60 * 60 * 1000);

    const leads = await Leads.find({
        $and: [
            // Excluir los estados que nunca deben estar disponibles
            {
                "flows.client_status": { 
                    $nin: ["compró", "no compró"] 
                }
            },
            {
                $or: [
                    // Casos que entran directamente por su estado
                    {
                        "flows.client_status": {
                            $in: [
                                "esperando",
                                "transferido al vendedor",
                                "vendedor",
                                "vendedor derivado", 
                                "sin definición"
                            ]
                        }
                    },
                    // Casos con toContact igual o menor a la fecha actual
                    {
                        $and: [
                            { "flows.client_status": "a contactar" },
                            { "flows.toContact": { $lte: currentDate } }
                        ]
                    },
                    // CAMBIO: Casos donde el flowDate es menor o igual a la fecha actual
                    {
                        $and: [
                            {
                                "flows.client_status": {
                                    $in: [
                                        "primer contacto",
                                        "flow enviado",
                                        "flow recibido",
                                        "flow leído",
                                        "falló envío"
                                    ]
                                }
                            },
                            {
                                $expr: {
                                    $lt: [
                                        {
                                            $dateFromString: {
                                                dateString: "$flows.flowDate",
                                                onError: new Date(0)
                                            }
                                        },
                                        twentyFourHoursAgo
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }).lean();

    return leads
        .filter((lead) => lead.botSwitch !== "OFF")
        .map((lead) => {
            const lastFlow = lead.flows.length > 0 ? lead.flows[lead.flows.length - 1] : null;

            return {
                name: lead.name,
                id_user: lead.id_user,
                botSwitch: lead.botSwitch,
                lastFlow: lastFlow
                    ? {
                        flowName: lastFlow.flowName,
                        flowDate: lastFlow.flowDate,
                        client_status: lastFlow.client_status,
                        toContact: lastFlow.toContact,
                        messages: lastFlow.messages,
                        brand: lastFlow.brand,
                        model: lastFlow.model,
                        price: lastFlow.price,
                        otherProducts: lastFlow.otherProducts,
                        payment: lastFlow.payment,
                        dni: lastFlow.dni,
                        credit: lastFlow.credit,
                        questions: lastFlow.questions,
                        messages: lastFlow.messages,
                        vendor_name: lastFlow.vendor_name,
                        vendor_phone: lastFlow.vendor_phone,
                        history: lastFlow.history,
                        flow_2token: lastFlow.flow_2token,
                        flow_status: lastFlow.flow_status,
                        error: lastFlow.error,
                        origin: lastFlow.origin,
                    }
                    : null,
            };
        });
};
