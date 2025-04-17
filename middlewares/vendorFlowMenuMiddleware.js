import { handleWhatsappMessage } from "../utils/whatsapp/handleWhatsappMessage.js";
import { findFlowLeadsForVendors } from "../utils/dataBase/findFlowLeadsForVendors.js";
import { findOneLeadForVendor } from "../utils/dataBase/findOneLeadForVendor.js";
import { salesFlow_2Notification } from "../flows/salesFlow_2Notification.js";
import { sendExcelByWhatsApp } from "../utils/excel/sendExcelByWhatsApp.js";
import { getMediaWhatsappUrl } from "../utils/media/getMediaWhatsappUrl.js";
import { downloadWhatsAppMedia } from "../utils/media/downloadWhatsAppMedia.js";
//import { processExcelToChangeLeads } from "../utils/excel/processExcelToChangeLeads.js";
//import { processExcelToChangeLeads } from "../utils/excel/processExcelToChangeLeads2.js";
import { processExcelToChangeLeads } from "../utils/excel/processExcelToChangeLeads3.js";
import { exportFlowLeadsToTemplate } from "../utils/excel/exportFlowLeadsToTemplate.js";
import { verifyLead } from "../utils/dataBase/verifyLead.js";
import { sendMenuToVendor } from "../utils/templates/sendMenuToVendor.js";

export const vendorsFlowMenuMiddleware = async (req, res, next) => {
	const body = req.body;
	const name = body?.entry[0]?.changes[0]?.value?.contacts?.[0]?.profile?.name
		? body.entry[0].changes[0].value.contacts[0].profile.name
		: "usuario";
	let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages?.[0]
		?.type
		? body.entry[0].changes[0].value.messages[0].type
		: body.entry[0].changes[0];
	const userPhone = body.entry[0].changes[0]?.value?.messages?.[0]?.from
		? body.entry[0].changes[0].value.messages[0].from
		: "";
	const message =
		typeOfWhatsappMessage === "text"
			? body.entry[0].changes[0].value.messages[0].text.body
			: typeOfWhatsappMessage === "document"
			? body.entry[0].changes[0].value.messages[0].document.caption
			: "no se pudo extraer el mensaje";
	let vendor = false;

	// Teléfono de los vendedores
	const vendor1 = process.env.PHONE_GUSTAVO_GLUNZ;
	const vendor2 = process.env.PHONE_GUSTAVO_GOMEZ_VILLAFANE;
	const vendor3 = process.env.JOHANNA;
	const vendor4 = process.env.ERNESTO;
	const vendor5 = process.env.JOSELIN;
	const vendor6 = process.env.DARIO;
	const vendor7 = process.env.JOSE;
	const vendor8 = process.env.PABLO;
	const vendor9 = process.env.MARIANO;
	const vendor10 = process.env.LAUTARO;
	const vendor11 = process.env.REINA;
	let vendorName;

	// Determiar si es un vendedor
	if (
		userPhone === vendor1 ||
		userPhone === vendor2 ||
		userPhone === vendor3 ||
		userPhone === vendor4 ||
		userPhone === vendor5 ||
		userPhone === vendor6 ||
		userPhone === vendor8 ||
		userPhone === vendor9 ||
		userPhone === vendor10 ||
		userPhone === vendor11
	) {
		vendor = true;
		// Nombre del vendedor
		vendorName =
			userPhone === vendor1
				? "Gustavo_Glunz"
				: userPhone === vendor2
				? "Gustavo_GV"
				: userPhone === vendor3
				? "Johanna"
				: userPhone === vendor4
				? "Ernesto"
				: userPhone === vendor5
				? "Joselin"
				: userPhone === vendor6
				? "Darío"
				: userPhone === vendor7
				? "José"
				: userPhone === vendor8
				? "Pablo"
				: userPhone === vendor9
				? "Mariano"
				: userPhone === vendor10
				? "Lautaro"
				: userPhone === vendor11
				? "Reina"
				: "";
	}

	// Check del tipo de msje
	if (typeOfWhatsappMessage !== "text" && vendor === false) {
		// El Lead manda mensaje que NO sea texto

		res.status(200).send("EVENT_RECEIVED");

		const notification = `*🔔 Notificación MEGAMOTO:*\n\n❗ Estimado /a ${name}, esta es una línea de WhatsApp que *solo procesa mensajes de texto*.\nPor favor enviá tu mensaje en texto.\n\n*¡Tu moto está más cerca en MEGAMOTO!*`;

		await handleWhatsappMessage(userPhone, notification);

		console.log(
			`El lead ${name} envió un mensaje en otro formato y recibió una notificación de error.`
		);
	} else if (vendor === true) {
		// -----------------Es un VENDEDOR ----------------------------
		res.status(200).send("EVENT_RECEIVED");

		if (
			typeOfWhatsappMessage !== "document" &&
			typeOfWhatsappMessage !== "interactive"
		) {
			// Recibe el menú si manda texto o audio
			const notification = `*🔔 Notificación MEGAMOTO:*\n\n📝 Entrá a tu celular para ver el *Menú de Vendedor*.\n\n*Megamoto*`;

			await handleWhatsappMessage(userPhone, notification);

			await sendMenuToVendor(userPhone);
            
		} else if (typeOfWhatsappMessage === "interactive") {
		} else if (typeOfWhatsappMessage === "document") {
		}
	} else {
		next();
	}
};
