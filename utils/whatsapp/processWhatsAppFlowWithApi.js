import Leads from "../../models/leads.js";
import { extractFlowResponses } from "../../flows/extractFlowResponses.js";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";
import { sendFlow_1ToLead } from "../../flows/sendFlow_1ToLead.js";
import {saveNotificationInDb} from "../dataBase/saveNotificationInDb.js"

export const processWhatsAppFlowWithApi = async (userMessage) => {
	const type = userMessage.type;
	let log;

	try {
		if (type === "interactive") {
			// Llama a función para identificar el Flow TOKEN y extraer la información
			const responses = extractFlowResponses(userMessage);

			const { finalNotification, flowToken } = responses;

			if (flowToken === 1) {
				// Manda whatsApp al Lead con la respuesta
				await handleWhatsappMessage(userMessage.userPhone, finalNotification);

				// Verificar que la respuesta esté completa
				if (finalNotification.includes("IMPORTANTE")){
					// Se vuelve a enviar el FLOW 1
					await sendFlow_1ToLead(userMessage)
					
					// Guarda en BD
					await saveNotificationInDb(userMessage, finalNotification)
					
					// Actualiza el log
					log = `1-Se extrajo la respuesta del Flow 1. 2-Se mandó whatsapp al lead x respuesta incompleta. 3-Se reenvió FLOW 1. `;
					
				} else {
					// Guarda en BD
					await saveNotificationInDb(userMessage, finalNotification)
					
					// Actualiza el log
					log = `1-Se extrajo la respuesta del Flow 1. 2-Se mandó whatsapp al lead de que un vendedor lo estará contactando.`;
				}

				return log;

			} else if (flowToken.startsWith("2")) {
			
			}
		} else {
			console.log(
				"No debió haber entrado aca ya que processWhatsAppFlowWithApi.js procesa type interactive"
			);
			return;
		}
	} catch (error) {
		console.error("Error en processWhatsAppFlowWithApi.js:", error.message);
		throw error.message;
	}
};
