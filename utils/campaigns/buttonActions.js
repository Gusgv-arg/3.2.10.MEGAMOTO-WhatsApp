import Leads from "../../models/leads.js";
import { addMessagesToThread } from "./addMessagesToThread.js";
import { handleWhatsappMessage } from "../handleWhatsappMessage.js";
import { logError } from "../errors/logError.js";
import { templateWhatsAppNotification } from "../notifications/templateWhatsAppNotification.js";

// Save the predefined button message in DB && in GPT Thread && notifiy vendor
export const buttonActions = async (
	senderId,
	message,
	predefinedMessage,
	button,
	templateName
) => {
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
			if (button === "préstamo") {
				currentCampaign.client_status = "préstamo";
			} else if (button === "contado") {
				currentCampaign.client_status = "contado";
			} else if (button === "tarjeta") {
				currentCampaign.client_status = "tarjeta";
			} else if (button === "no interesado") {
				currentCampaign.client_status = "no interesado";
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
			if (button === "contado" || button === "tarjeta") {
				const campaignDate = new Date(
					currentCampaign.campaignDate
				).toLocaleDateString("es-AR");

				// Clean the messages to remove new lines and excessive spaces
				const cleanMessages = currentCampaign.messages
					.replace(/[\n\t]+/g, " ")
					.replace(/ {2,}/g, " ");

				// Array with 6 Template variables in the format expected from WhatsApp
				const parameters = [
					{ type: "text", text: currentCampaign.campaignName },
					{ type: "text", text: campaignDate },
					{ type: "text", text: lead.name },
					{ type: "text", text: lead.id_user },
					{ type: "text", text: currentCampaign.client_status },
					{ type: "text", text: cleanMessages },
				];

				const vendor_phone = currentCampaign.vendor_phone;

				await templateWhatsAppNotification(
					templateName,
					vendor_phone,
					parameters
				);
			} else if (button === "dni") {
				const campaignDate = new Date(
					currentCampaign.campaignDate
				).toLocaleDateString("es-AR");
			}
		}
	} catch (error) {
		console.log("An error occured in buttonActions.js", error.message);
		throw error;
	}
};
