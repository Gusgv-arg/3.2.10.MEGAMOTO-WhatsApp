import Leads from "../../models/leads.js";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";
import { sendFlow_1ToLead } from "../../flows/sendFlow_1ToLead.js";
import { saveNotificationInDb } from "../dataBase/saveNotificationInDb.js";
import { findLeadWithFlowToken2 } from "../dataBase/findLeadWithFlowToken2.js";
import { sendVendorDataToLead } from "../templates/sendVendorDataToLead.js";
import { salesFlow_2Notification } from "../../flows/salesFlow_2Notification.js";
import {extractFlowToken_1Responses} from "../../flows/extractFlowToken_1Responses.js"

export const processWhatsAppFlowWithApi = async (userMessage) => {
	const type = userMessage.type;
	let log;

	try {
		if (type === "interactive") {
			// ---- TOKEN 1 -------------------------------------//
			if (userMessage.message.includes('"flow_token":"1"')) {
				const flowToken = 1;

				const extraction = await extractFlowToken_1Responses(userMessage.message);
				
				console.log("Extraction desde processWhatsAppFlowWithApi.js:", extraction);

				// Verificar si extraction comienza con "¡IMPORTANTE!"
				if (extraction.message.includes("IMPORTANTE:")) {
					const finalMessage = `*👋 Hola ${userMessage.name}!*\n${extraction.message}`;
					extraction.message = finalMessage;
					console.log("FinalMessage:", finalMessage);
					
				} else {
					const greet = `*👋 Hola ${userMessage.name}*, gracias por tu respuesta! En breve vas a recibir una notificación con los datos del vendedor que te estará contactando:\n\n${extraction.message}`;
					extraction.message = greet;
					console.log("FinalMessage:", greet);
										
				}

				// Manda whatsApp al Lead con la respuesta
				await handleWhatsappMessage(userMessage.userPhone, extraction.message);

				// Verificar que la respuesta esté completa
				if (extraction.message.includes("IMPORTANTE")) {
					// Se vuelve a enviar el FLOW 1 y me hago del wamId
					const wamId_Flow1 = await sendFlow_1ToLead(userMessage);

					// Agrego el wamId al objeto userMessage para traquear status FLOW1
					userMessage.wamId_Flow1 = wamId_Flow1;

					// Guarda en BD
					await saveNotificationInDb(userMessage, extraction);

					// Actualiza el log
					log = `1-Se extrajo la respuesta del Flow 1. 2-Se mandó whatsapp al lead x respuesta incompleta. 3-Se reenvió FLOW 1. `;
				} else {
					// Guarda en BD
					await saveNotificationInDb(userMessage, extraction);

					// Actualiza el log
					log = `1-Se extrajo la respuesta del Flow 1. 2-Se mandó whatsapp al lead de que un vendedor lo estará contactando.`;
				}

				return log;
			} else if (flowToken.startsWith("2")) {
				// ---- TOKEN 2 -------------------------------------//
				console.log("entre en token 2");
				let vendorPhone;
				let vendorName;
				let status;

				// Confirmar la respuesta al vendedor que envió la respuesta
				await handleWhatsappMessage(userMessage.userPhone, finalNotification);

				if (
					finalNotification.includes("Atender ahora") ||
					finalNotification.includes("Atender más tarde")
				) {
					vendorPhone = userMessage.userPhone;
					vendorName = userMessage.name;
					status = "vendedor";
				} else if (finalNotification.includes("Derivar a")) {
					if (delegate === "Derivar a Gustavo Glunz") {
						vendorPhone = process.env.PHONE_GUSTAVO_GLUNZ;
						vendorName = "Gustavo Glunz";
					} else if (delegate === "Derivar a Gustavo G.Villafañe") {
						vendorPhone = process.env.PHONE_GUSTAVO_GOMEZ_VILLAFANE;
						vendorName = "Gustavo Gómez Villafañe";
					} else if (delegate === "Derivar a Joana") {
						vendorPhone = process.env.PHONE_JOANA;
						vendorName = "Joana";
					}

					status = "vendedor derivado";
				}

				// Buscar Lead x token 2 y Guardar en BD los datos
				const customerData = await findLeadWithFlowToken2(
					flowToken,
					vendorPhone,
					vendorName,
					status,
					days,
					delegate,
					notes
				);
				const {
					customerPhone,
					customerName,
					brand,
					model,
					price,
					payment,
					dni,
					questions,
				} = customerData;
				console.log("customer:", customerData);

				if (delegate) {
					// Notificar al vendedor derivado
					const message = `*🔔 Notificación Automática:*\n\n📣 El vendedor ${userMessage.name} te derivó al cliente ${customerName}\n❗ Importante: entrá en tu celular para tomar el Lead.\n\nMegamoto`;

					await handleWhatsappMessage(vendorPhone, message);

					// Enviar el FLOW 2 al vendedor derivado
					const myLead = `Nombre: ${customerName}. Teléfono: ${customerPhone}. Marca: ${brand}. Modelo: ${model}. Precio: ${price}. Método de Pago: ${payment}. DNI: ${dni}. Preguntas: ${questions}. Notas del vendedor: ${notes}.`;

					await salesFlow_2Notification(myLead, vendorPhone, flowToken);
				} else if (!delegate) {
					// Notificar datos del vendedor al cliente con template (pueden pasar +24hs)
					await sendVendorDataToLead(
						customerPhone,
						customerName,
						vendorPhone,
						vendorName
					);
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
