import Leads from "../../models/leads.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";

async function listCampaigns(userPhone) {
	const leads = await Leads.find().populate("campaigns"); // Obtener todos los leads y sus campañas
	const summary = {};

	leads.forEach((lead) => {
		lead.campaigns.forEach((campaign) => {
			const { campaignName, campaignDate, campaign_status, client_status } =
				campaign;
			const formattedDate = new Date(campaignDate).toLocaleDateString("es-ES");

			if (!summary[campaignName]) {
				summary[campaignName] = {
					campaignDate: formattedDate,
					campaign_status,
					contacted: 0,
					responded: 0,
				};
			}
			if (client_status === "entregado" || client_status === "leído") {
				summary[campaignName].contacted++;
			} else if (client_status === "respuesta_cliente") {
				summary[campaignName].responded++;
				summary[campaignName].contacted++;
			}
		});
	});

	// Formatear el resultado en un string
	let result = "";

	for (const [campaignName, data] of Object.entries(summary)) {
		result += `${data.campaignDate} - ${campaignName}: ${data.campaign_status}. Cant.: ${data.contacted}. Resp.: ${data.responded}.\n`;
	}
	console.log("Result-->", result);
	await adminWhatsAppNotification(
		userPhone,
		`*LISTADO DE CAMPAÑAS*\n${result}`
	);
}
export default listCampaigns;
