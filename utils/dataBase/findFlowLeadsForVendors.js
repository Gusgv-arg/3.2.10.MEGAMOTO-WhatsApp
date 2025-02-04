import Leads from "../../models/leads.js";

// Función que trae todo los Leads disponibles para atender
export const findFlowLeadsForVendors = async () => {
	const currentDate = new Date();
	const twentyFourHoursAgo = new Date(currentDate - 24 * 60 * 60 * 1000);

	console.log("ahora:", currentDate);
	console.log("24hs atras:", twentyFourHoursAgo);
	console.log("24hs atrás (ISO):", twentyFourHoursAgo.toISOString());

	const leads = await Leads.find({
		$or: [
			// Entran directamente
			{
				"flows.client_status": {
					$in: [
						"esperando",
						"transferido al vendedor",
						"vendedor",
						"vendedor derivado",
						"sin definición",
					],
				},
			},
			// Caso 'a contactar' - se verifica por fecha toContact
			{
				$and: [
					{ "flows.client_status": "a contactar" },
					{ "flows.toContact": { $lte: currentDate } },
				],
			},
			// Casos que despues de 24 horas del contacto se pasan a la Fila
			{
				$and: [
					{
						"flows.client_status": {
							$in: [
								"primer contacto",
								"enviado",
								"leído",
								"falló envío",
								"falta DNI",
								"falta modelo",
								"faltan modelo y DNI",
								"error",
							],
						},
					},
					{
						$expr: {
							$lt: [
								{
									$toDate: {
										$let: {
											vars: {
												fullDate: { $arrayElemAt: ["$flows.flowDate", -1] },
												datePart: { 
													$substr: [
														{ $arrayElemAt: ["$flows.flowDate", -1] },
														0,
														10
													]
												},
												timePart: {
													$substr: [
														{ $arrayElemAt: ["$flows.flowDate", -1] },
														12,
														8
													]
												},
												isPM: {
													$regexMatch: {
														input: { $arrayElemAt: ["$flows.flowDate", -1] },
														regex: "p\\. m\\."
													}
												}
											},
											in: {
												$concat: [
													{ $substr: ["$$datePart", 6, 4] }, "-",  // año
													{ $substr: ["$$datePart", 3, 2] }, "-",  // mes
													{ $substr: ["$$datePart", 0, 2] }, "T",  // día
													{
														$toString: {
															$add: [
																{ $toInt: { $substr: ["$$timePart", 0, 2] } },
																{
																	$cond: [
																		{ $and: ["$$isPM", { $ne: [{ $toInt: { $substr: ["$$timePart", 0, 2] } }, 12] }] },
																		12,
																		0
																	]
																}
															]
														}
													},
													{ $substr: ["$$timePart", 2, 6] },  // resto del tiempo (minutos y segundos)
													"Z"
												]
											}
										}
									}
								},
								twentyFourHoursAgo
							]
						}
					}
				],
			},
		],
	}).lean();

	return (
		leads
			.filter((lead) => lead.botSwitch !== "OFF")
			/* .filter((lead) => {
			const lastFlow = lead.flows[lead.flows.length - 1];
			return !lastFlow || !lastFlow.vendor_phone || lastFlow.vendor_phone !== "";
		}) */
			.map((lead) => {
				const lastFlow =
					lead.flows.length > 0 ? lead.flows[lead.flows.length - 1] : null;

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
								brand: lastFlow.brand,
								model: lastFlow.model,
								price: lastFlow.price,
								otherProducts: lastFlow.otherProducts,
								payment: lastFlow.payment,
								dni: lastFlow.dni,
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
			})
	);
};
