import Leads from "../../models/leads.js";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";
import { sendFlow_1ToLead } from "../../flows/sendFlow_1ToLead.js";
import { saveNotificationInDb } from "../dataBase/saveNotificationInDb.js";
import { findLeadWithFlowToken2 } from "../dataBase/findLeadWithFlowToken2.js";
import { sendVendorDataToLead } from "../templates/sendVendorDataToLead.js";
import { salesFlow_2Notification } from "../../flows/salesFlow_2Notification.js";
import { extractFlowToken_1Responses } from "../../flows/extractFlowToken_1Responses.js";
import { extractFlowToken_2Responses } from "../../flows/extractFlowToken_2Responses.js";

export const processWhatsAppFlowWithApi = async (userMessage) => {
	const type = userMessage.type;
	let log;

	try {
		if (type === "interactive") {
			// ---- TOKEN 1 -------------------------------------//
			if (userMessage.message.includes('"flow_token":"1"')) {
				const flowToken = 1;

				const notification = await extractFlowToken_1Responses(
					userMessage.message
				);

				//console.log("notification desde processWhatsAppFlowWithApi.js:", notification);

				// Verificar si extraction comienza con "¡IMPORTANTE!"
				if (notification.message.includes("IMPORTANTE:")) {
					const finalMessage = `*👋 Hola ${userMessage.name}!*\n${notification.message}`;
					notification.message = finalMessage;
					//console.log("FinalMessage:", finalMessage);
				} else {
					const greet = `*👋 Hola ${userMessage.name}*, gracias por tu respuesta! En breve vas a recibir una notificación con los datos del vendedor que te estará contactando:\n\n${notification.message}`;
					notification.message = greet;
					//console.log("FinalMessage:", greet);
				}

				// Manda whatsApp al Lead con la respuesta
				await handleWhatsappMessage(
					userMessage.userPhone,
					notification.message
				);

				// Verificar que la respuesta esté completa
				if (notification.message.includes("IMPORTANTE")) {
					// Se vuelve a enviar el FLOW 1 y me hago del wamId
					const wamId_Flow1 = await sendFlow_1ToLead(userMessage);

					// Agrego el wamId al objeto userMessage para traquear status FLOW1
					userMessage.wamId_Flow1 = wamId_Flow1;

					// Guarda en BD
					await saveNotificationInDb(userMessage, notification);

					// Actualiza el log
					log = `1-Se extrajo la respuesta del Flow 1 de ${userMessage.name}. 2-Se mandó whatsapp al lead x respuesta incompleta: ${notification.message}. 3-Se reenvió FLOW 1. `;
				} else {
					// Guarda en BD
					await saveNotificationInDb(userMessage, notification);

					// Actualiza el log
					log = `1-Se extrajo la respuesta del Flow 1 de ${userMessage.name}. 2-Se mandó whatsapp al lead de que un vendedor lo estará contactando.`;
				}

				return log;

			} else if (/\"flow_token\":\"2/.test(userMessage.message)) {
				// ---- TOKEN 2 -------------------------------------//
				let vendorPhone;
				let vendorName;

				const notification = extractFlowToken_2Responses(userMessage.message);

				log = `1-Se extrajo la respuesta del Flow 2 del vendedor ${userMessage.name}. `

				// Confirmar la respuesta al vendedor que envió la respuesta
				await handleWhatsappMessage(
					userMessage.userPhone,
					notification.message
				);

				if (
					notification.message.includes("Atender ahora") ||
					notification.message.includes("Atender más tarde")
				) {
					vendorPhone = userMessage.userPhone;
					vendorName = userMessage.vendorName;
					log += `La respuesta fue ${notification.message}. `

				} else if (notification.message.includes("Derivar a")) {
					if (notification.delegate === "Derivar a Gustavo Glunz") {
						vendorPhone = process.env.PHONE_GUSTAVO_GLUNZ;
						vendorName = "Gustavo_Glunz";
					} else if (
						notification.delegate === "Derivar a Gustavo G.Villafañe"
					) {
						vendorPhone = process.env.PHONE_GUSTAVO_GOMEZ_VILLAFANE;
						vendorName = "Gustavo_GV";
					} else if (notification.delegate === "Derivar a Joana") {
						vendorPhone = process.env.PHONE_JOANA;
						vendorName = "Joana";
					}

					log += `La respuesta fue ${notification.message}. `
				}

				// Buscar Lead x token 2 y Guardar en BD los datos
				const senderName = userMessage.name;

				const customerData = await findLeadWithFlowToken2(
					notification,
					vendorPhone,
					vendorName,
					senderName
				);
				const {
					customerPhone,
					customerName,
					brand,
					model,
					otherProducts,
					price,
					payment,
					dni,
					questions,
				} = customerData;
				//console.log("customer:", customerData);

				if (notification.delegate) {
					// Notificar al vendedor derivado
					const message = `*🔔 Notificación Automática:*\n\n📣 El vendedor ${userMessage.name} te derivó al cliente ${customerName}\n❗ Importante: entrá en tu celular para tomar el Lead.\n\n*Megamoto*`;

					await handleWhatsappMessage(vendorPhone, message);

					// Enviar el FLOW 2 al vendedor derivado
					const myLead = `Nombre: ${customerName}. Teléfono: ${customerPhone}. Marca: ${brand}. Modelo: ${model}. Precio: ${price}. ${otherProducts} Método de Pago: ${payment}. DNI: ${dni}. Preguntas: ${questions}. Notas del vendedor: ${notification.notes}.`;

					await salesFlow_2Notification(
						myLead,
						vendorPhone,
						notification.flowToken
					);

					log += `Se lo notificó al vendedor ${vendorName} que le derivaron a ${customerName} y se le envió el Flow 2 con toda la info. `
				
				} else if (!notification.delegate) {
					// Notificar datos del vendedor al cliente con template (pueden pasar +24hs)
					await sendVendorDataToLead(
						customerPhone,
						customerName,
						vendorPhone,
						vendorName
					);

					// Grabar en BD la notificación al cliente
					const message = `*🔔 Notificación de Megamoto:*\n\n👋 Hola ${customerName}, tenemos buenas noticias! Tu consulta fue tomada por un vendedor:\n				Nombre: ${vendorName}. Celular: ${vendorPhone}\n❗ Te recomendamos agendar sus datos así lo reconoces cuando te contacte.\n¡Mucha suerte con tu compra!`;
					
					const notification = {message: message}
					const userMessage = {userPhone: customerPhone}

					await saveNotificationInDb(userMessage, notification)

					log += `Se lo notificó al lead ${customerName} que su vendedor asignado es ${vendorName}. `
				}

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
		const errorMessage = `Error en processWhatsAppFlowWithApi.js: ${error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message}`;
		
		throw errorMessage;
	}
};
