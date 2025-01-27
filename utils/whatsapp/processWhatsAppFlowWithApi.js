import Leads from "../../models/leads.js";
import { extractFlowResponses } from "../../flows/extractFlowResponses.js";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";
import { sendFlow_1ToLead } from "../../flows/sendFlow_1ToLead.js";
import { saveNotificationInDb } from "../dataBase/saveNotificationInDb.js";
import { findLeadWithFlowToken2 } from "../dataBase/findLeadWithFlowToken2.js";
import { sendVendorDataToLead } from "../templates/sendVendorDataToLead.js";

export const processWhatsAppFlowWithApi = async (userMessage) => {
	const type = userMessage.type;
	let log;

	try {
		if (type === "interactive") {
			// Llama a función para identificar el Flow TOKEN y extraer la información
			const responses = await extractFlowResponses(userMessage);

			const { finalNotification, flowToken, days, delegate, notes } = responses;
			
			console.log(`Desde processWhatsAppFlowWithApi.js:\nfinalNotifiction: ${finalNotification}\nflowToken: ${flowToken}\ndays: ${days}\ndelegate: ${delegate}\nnotes: ${notes}`)

			if (flowToken === 1) {
				// Manda whatsApp al Lead con la respuesta
				await handleWhatsappMessage(userMessage.userPhone, finalNotification);

				// Verificar que la respuesta esté completa
				if (finalNotification.includes("IMPORTANTE")) {
					// Se vuelve a enviar el FLOW 1 y me hago del wamId
					const wamId_Flow1 = await sendFlow_1ToLead(userMessage);

					// Agrego el wamId al objeto userMessage para traquear status FLOW1
					userMessage.wamId_Flow1 = wamId_Flow1;

					// Guarda en BD
					await saveNotificationInDb(userMessage, finalNotification);

					// Actualiza el log
					log = `1-Se extrajo la respuesta del Flow 1. 2-Se mandó whatsapp al lead x respuesta incompleta. 3-Se reenvió FLOW 1. `;
				} else {
					// Guarda en BD
					await saveNotificationInDb(userMessage, finalNotification);

					// Actualiza el log
					log = `1-Se extrajo la respuesta del Flow 1. 2-Se mandó whatsapp al lead de que un vendedor lo estará contactando.`;
				}

				return log;
			} else if (flowToken.startsWith("2")) {
				console.log("entre en token 2");

				// Confirmar la respuesta al vendedor
				await handleWhatsappMessage(userMessage.userPhone, finalNotification);

				if (finalNotification.includes("Atender ahora") || finalNotification.includes("Atender más tarde")) {
					const vendorPhone = userMessage.userPhone;
					const vendorName = userMessage.name;
					const status = "vendedor";

					// 2-Buscar Lead x token 2 y Guardar en BD los datos del vendedor
					const customerData = await findLeadWithFlowToken2(
						flowToken,
						vendorPhone,
						vendorName,
						status,
						days,
						delegate,
						notes
					);
					console.log("customer:", customerData);

					const { customerPhone, customerName } = customerData;

					// 2-Notificar datos del vendedor al cliente con template (pueden pasar +24hs)
					await sendVendorDataToLead(
						customerPhone,
						customerName,
						vendorPhone,
						vendorName
					);
				
				} else if (finalNotification.includes("Derivar a")) {
					console.log("entre en derivar a!!")
					// 1-Notificar cliente.
					// 2-Notificar vendedor derivado.
					// 3-Guardar en BD
				}

				log = `1-Se extrajo la respuesta del Flow 2. 2-Se mandó WhatsApp al lead con los datos del vendedor. 3-Se le confirmó al vendedor de su respuesta.`;

				return log;
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
