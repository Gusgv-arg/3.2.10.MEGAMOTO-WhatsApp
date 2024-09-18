import Leads from "../models/leads.js";
import { adminWhatsAppNotification } from "./adminWhatsAppNotification.js";

export const changeCampaignStatus = async (campaignStatus, campaignName, userPhone) => {
	try {
		const users = await Leads.find();
		let counter = 0;
		
		for (const user of users) {
			const campaign = user.campaigns.find(
				(c) => c.campaignName === campaignName
			);

			if (campaign) {
				if (campaignStatus === "activa") {
					campaign.campaign_status = "activa";
					counter++;
				} else if (campaignStatus === "inactiva") {
					campaign.campaign_status = "inactiva";
					counter++;
				}
			}
		}

		await Promise.all(users.map((user) => user.save()));
		await adminWhatsAppNotification(userPhone,`*NOTIFICACION cambio Status de Campaña:*\nPara la Campaña *${campaignName}* se cambiaron *${counter}* registros de clientes al status de Campaña *${campaignStatus}*.`);
	} catch (error) {
		console.log("Error en changeCampaignStatus.js", error.message);
		throw error;
	}
};