import Leads from "../models/leads.js";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";

const myPhone = process.env.MY_PHONE;

export const statusMiddleware = async (req, res, next) => {
	const body = req.body;
	let status = body?.entry?.[0].changes?.[0].value?.statuses?.[0]
		? body.entry[0].changes[0].value.statuses[0]
		: null;

	// Check status update && save in DB
	if (status !== null) {
		//console.log("Status-->", status);
		const recipient_id =
			body.entry[0].changes[0].value.statuses[0].recipient_id;
		const wab_id = body.entry[0].changes[0].value.statuses[0].id;
		let newStatus = body.entry[0].changes[0].value.statuses[0].status;

		if (newStatus === "sent") {
			newStatus = "enviado";
		} else if (newStatus === "delivered") {
			newStatus = "entregado";
		} else if (newStatus === "read") {
			newStatus = "leído";
		}

		try {
			// Look in leads for the last Campaign && check if its the id of the sent message
			let lead = await Leads.findOne({ id_user: recipient_id });

			// Return if there is no lead in DB
			if (!lead) {
				//console.log(`No se encontró lead con id_user: ${recipient_id}`);
				res.status(200).send("EVENT_RECEIVED");
				return;
			}

			// Return if there are no Campaigns
			if (!lead.campaigns || lead.campaigns.length === 0) {
				/* console.log(
					`Exiting process of status updating for "${lead.name}" that has no Campaigns registrated.`
				); */
				res.status(200).send("EVENT_RECEIVED");
				return;
			} else {
				// Process if there are Campaigns
				const lastCampaignRecord = lead.campaigns[lead.campaigns.length - 1];
				//console.log(lead)

				if (lastCampaignRecord.wamId === wab_id) {
					lastCampaignRecord.client_status = newStatus;
					/* console.log(
						`Actualizó el status de mensaje de "${lead.name}" a "${newStatus}"`
					); */
					await lead.save();
				} else {
					/* console.log(
						`Encontró el lead "${lead.name}" y hay Campaña pero actualiza status de otro msje.`
					); */
				}

				res.status(200).send("EVENT_RECEIVED");
				return;
			}
		} catch (error) {
			console.log("Error in statusMiddleware.js", error.message);
			await adminWhatsAppNotification(myPhone, error.message);
		}
	} else {
		next();
	}
};
