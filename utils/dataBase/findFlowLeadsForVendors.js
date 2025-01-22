import Leads from "../../models/leads.js";

// Función que trae todo los Leads disponibles para atender
export const findFlowLeadsForVendors = async () => {
	const currentDate = new Date();
	const twentyFourHoursAgo = new Date(currentDate - 24 * 60 * 60 * 1000);

	const leads = await Leads.find({
		$or: [
			// Casos que entran directamente
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
			// Casos que requieren 24 horas desde flowDate
			{
				$and: [
					{
						"flows.client_status": {
							$in: [
								"contactado",
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
					{ "flows.flowDate": { $lte: twentyFourHoursAgo.toISOString() } },
				],
			},
		],
	}).lean();

	return leads
		.filter((lead) => lead.botSwitch !== "OFF")
		.filter((lead) => {
			const lastFlow = lead.flows[lead.flows.length - 1];
			return !lastFlow || !lastFlow.vendor_phone || lastFlow.vendor_phone !== "";
		})
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
					  }
					: null,
			};
		});
};
