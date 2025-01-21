import { handleWhatsappMessage } from "../utils/whatsapp/handleWhatsappMessage.js";
import { findFlowLeadsForVendors } from "../utils/dataBase/findFlowLeadsForVendors.js";
import { findOneLeadForVendor } from "../utils/dataBase/findOneLeadForVendor.js";
import {salesFlow_2Notification} from "../flows/salesFlow_2Notification.js"

export const vendorsFunctionsMiddleware = async (req, res, next) => {
	const body = req.body;
	let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages?.[0]
		?.type
		? body.entry[0].changes[0].value.messages[0].type
		: body.entry[0].changes[0];
	const userPhone = body.entry[0].changes[0]?.value?.messages?.[0]?.from
		? body.entry[0].changes[0].value.messages[0].from
		: "";

	// Teléfono de los vendedores
	const vendor1 = process.env.PHONE_GUSTAVO_GLUNZ;
	const vendor2 = process.env.PHONE_GUSTAVO_GOMEZ_VILLAFANE;

	// Check de que msje sea del vendedor y de tipo texto o documento (para cuando manden excel)
	if (
		(typeOfWhatsappMessage === "text" && userPhone === vendor1) ||
		(typeOfWhatsappMessage === "document" && userPhone === vendor1) ||
		(typeOfWhatsappMessage === "text" && userPhone === vendor2) ||
		(typeOfWhatsappMessage === "document" && userPhone === vendor2)
	) {
		let message;
		let documentId;

		if (typeOfWhatsappMessage === "text") {
			message =
				body.entry[0].changes[0].value.messages[0].text.body.toLowerCase();
		} else if (typeOfWhatsappMessage === "document") {
			message =
				body.entry[0].changes[0].value.messages[0].document.caption.toLowerCase();
			documentId = body.entry[0].changes[0].value.messages[0].document.id;
		} else if (typeOfWhatsappMessage === "interactive") {
			// Hace next si es un vendedor y es un Flow
			next();
		} else {
			// Si vendedor manda algo que no sea texto, documento o Flow lo rebota
			res.status(200).send("EVENT_RECEIVED");

			const notification = `*Notificación automática:*\nLos vendedores solo pueden enviar mensajes de Texto, responder a un Flow para tomar un lead o enviar un Excel para cambiar el estado.`;

			await handleWhatsappMessage(userPhone, notification);
		}

		// ---- Funciones disponibles para los vendedores -------------------------------
		if (message === "lead" || message === "leads") {
			res.status(200).send("EVENT_RECEIVED");

            // Se buscan los leads a atender
			const allLeads = await findFlowLeadsForVendors();

			// Llama función q toma el lead más viejo entre creación y toContact
			const myLead = findOneLeadForVendor(allLeads);
			
			// Se notifica al vendedor por si no ve el Flow
			const notification = "*Notificación automática:*\nSe te está por enviar un FLOW para asignarte un Lead. Si estas en tu pc y no lo ves entrá en WhatsApp desde tu celular.\n¡Buena suerte con tu venta!\n\nMegamoto"
			const vendorPhone = userPhone;

			await handleWhatsappMessage(vendorPhone, notification)

			// Se envía el FLOW 2 al vendedor
			await salesFlow_2Notification( myLead, vendorPhone);
					
		} else {
			next();
		}
	} else {
		next();
	}
};
