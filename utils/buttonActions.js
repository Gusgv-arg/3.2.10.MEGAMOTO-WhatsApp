import Leads from "../models/leads.js";
import { addMessagesToThread } from "./addMessagesToThread.js";
import { handleWhatsappMessage } from "./handleWhatsappMessage.js";
import { logError } from "./logError.js";

// Save the predefined button message in DB && in GPT Thread && notifiy vendor
export const buttonActions = async (senderId, message, predefinedMessage, button) => {
	try {
		// --------------- SAVE IN DB -----------------------//
		// Find the lead
		let lead = await Leads.findOne({ id_user: senderId });

		// If the lead does not exist there is an error and returns.
		if (lead === null) {
			console.log("¡¡ERROR: Lead not found in DB!!");
			throw new Error(
				"*Notificación de Error:*\nEl usuario no se encontró en la base de datos. Se produjo al intentar grabar la respuesta predefinida del botón."
			);
		} else {
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

			// Look for the last record in Campaigns array
			const currentCampaign = lead.campaigns[lead.campaigns.length - 1];

			if (!currentCampaign) {
				throw new Error("*NOTIFICACION DE ERROR:*\nCampaña no encontrada.");
				return;
			}

			// Concatenate the campaign message with the previous ones
			const newMessageContent = `\n${currentDateTime} - ${lead.name}: ${message}.\nMegaBot: ${predefinedMessage}`;

			// Replace the messages history with the new one
			currentCampaign.messages = currentCampaign.messages
				? currentCampaign.messages + newMessageContent
				: newMessageContent;

			// Update Campaign status
			if (button === "vendedor"){
				currentCampaign.client_status = "vendedor";
			} else if (button === "dni") {
				currentCampaign.client_status = "dni";
			}

			// Clean error if it existed
			if (currentCampaign.error) {
				currentCampaign.error = null;
			}

			// Update lead
			await lead.save();
			console.log("Lead updated with campaign message in Leads DB");

			// --------------- SAVE IN GPT THREAD -----------------------//
			await addMessagesToThread(
				currentCampaign.campaignThreadId,
				message,
				predefinedMessage
			);

			// --------------- NOTIFY VENDOR -----------------------//
			// Diferentiate wich button was pressed
			if (button === "vendedor"){
				const leadDetails = `*NOTIFICACION DE LEAD*\n*Campaña:* ${currentCampaign.campaignName}\n*Fecha Campaña:* ${new Date(currentCampaign.campaignDate).toLocaleDateString("es-AR")}\n*Cliente:* ${lead.name}\n*Teléfono:* ${lead.id_user}\n*Estado Cliente:* ${currentCampaign.client_status}\n*Conversación:* ${currentCampaign.messages}`;
				await handleWhatsappMessage(currentCampaign.vendor_phone, leadDetails)
				
			} else if (button === "dni") {
				const dniNotification = `*NOTIFICACION DE DNI*\n*Campaña:* ${currentCampaign.campaignName}\n*Fecha Campaña:* ${new Date(currentCampaign.campaignDate).toLocaleDateString("es-AR")}\n*Cliente:* ${lead.name}\n*Teléfono:* ${lead.id_user}\n*Estado Cliente:* ${currentCampaign.client_status}\n*Conversación:* ${currentCampaign.messages}`
				console.log("definir si hacemos algo cuando apreta boton de dni")
				
				//await handleWhatsappMessage(currentCampaign.vendor_phone, dniNotification)
			}

			return;
		}
	} catch (error) {
		console.log("An error occured in buttonActions.js", error.message);
		throw new Error(error.message);
	}
};
