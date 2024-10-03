import Leads from "../models/leads.js";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

const myPhone = process.env.MY_PHONE;

export const statusMiddleware = async (req, res, next) => {
	const body = req.body;
	let status = body?.entry?.[0].changes?.[0].value?.statuses?.[0]
		? body.entry[0].changes[0].value.statuses[0]
		: null;

	// Check status update && save in DB
	if (status !== null) {
		console.log("Status-->", status);
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
			const lastCampaignRecord = lead.campaigns[lead.campaigns.length -1];

			if (lastCampaignRecord.wab_id === wab_id) {
				lastCampaignRecord.client_status = newStatus;
				await lead.save();
			} else {
                console.log(`Encontró el lead ${lead.name} pero actualiza status de otro msje.`)
            }

			res.status(200).send("EVENT_RECEIVED");
			return;
		} catch (error) {
			console.log("Error in statusMiddleware.js", error.message);
			await adminWhatsAppNotification(myPhone, error.message);
		}
	} else {
		next();
	}
};
