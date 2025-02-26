import Leads from "../models/leads.js";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";
import axios from "axios"

const myPhone = process.env.MY_PHONE;

export const statusFlowsMiddleware = async (req, res, next) => {
	const body = req.body;
	let status = body?.entry?.[0].changes?.[0].value?.statuses?.[0]
		? body.entry[0].changes[0].value.statuses[0]
		: null;

	// Se prende web de Credicuotas
	const crediCuotas = await axios.get("https://three-2-13-web-scrapping.onrender.com")
	console.log("Credicuotas", crediCuotas?.status)
	if (crediCuotas?.status === "200"){
		req.crediCuotas
	}
	
	// Obtain current date and hour
	const currentDateTime = new Date().toLocaleString("es-AR", {
		timeZone: "America/Argentina/Buenos_Aires",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	// Check status update && save in DB
	if (status !== null) {
		//console.log("Id:", status.id, "Status:", status.status);
		const recipient_id =
			body.entry[0].changes[0].value.statuses[0].recipient_id;
		const wab_id = body.entry[0].changes[0].value.statuses[0].id;
		let newStatus = body.entry[0].changes[0].value.statuses[0].status;

		if (newStatus === "sent") {
			newStatus = "flow enviado";
		} else if (newStatus === "delivered") {
			newStatus = "flow recibido";
		} else if (newStatus === "read") {
			newStatus = "flow leído";
		} else if (newStatus === "failed") {
			newStatus = "falló envío";
		}

		try {
			// Look in leads for the last Campaign && check if its the id of the sent message
			let lead = await Leads.findOne({ id_user: recipient_id });

			// Return if there is no lead in DB
			if (!lead) {
				console.log(`No se encontró lead con id_user: ${recipient_id}`);
				res.status(200).send("EVENT_RECEIVED");
				return;
			}

			// Return if there are no Campaigns
			if (!lead.flows || lead.flows.length === 0) {
				/* console.log(
					`Exiting process of status updating for "${lead.name}" that has no Flows registrated.`
				); */
				res.status(200).send("EVENT_RECEIVED");
				return;
			} else {
				// Process if there are Flows
				const lastFlowRecord = lead.flows[lead.flows.length - 1];
				//console.log(lead)

				if (lastFlowRecord.wamId_flow1 === wab_id) {
					lastFlowRecord.client_status = newStatus;
					lastFlowRecord.history += `${currentDateTime} - Status: ${newStatus}. `;
					console.log(
						`Se actualizó el status de mensaje de "${lead.name}" a "${newStatus}"`
					);
					await lead.save();
				} else {
					/* console.log(
						`Encontró a "${lead.name}" con un Flow pero NO se hace nada actualiza status de otro msje.`
					); */
				}

				res.status(200).send("EVENT_RECEIVED");
				return;
			}
		} catch (error) {
			const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message

			console.log("Error in statusFlowsMiddleware.js", errorMessage);

			const message = `🔔 *NOTIFICACION DE ERROR en statusFlowsMiddleware.js:* Error: ${errorMessage}`;
			
			await adminWhatsAppNotification(myPhone, message);
		}
	} else {
		next();
	}
};
