import { handleWhatsappMessage } from "../utils/whatsapp/handleWhatsappMessage.js";
import { findFlowLeadsForVendors } from "../utils/dataBase/findFlowLeadsForVendors.js";
import { findOneLeadForVendor } from "../utils/dataBase/findOneLeadForVendor.js";
import { salesFlow_2Notification } from "../flows/salesFlow_2Notification.js";
import { exportFlowLeadsToExcel } from "../utils/excel/exportFlowLeadsToExcel.js";
import { sendExcelByWhatsApp } from "../utils/excel/sendExcelByWhatsApp.js";
import { getMediaWhatsappUrl } from "../utils/media/getMediaWhatsappUrl.js";
import { downloadWhatsAppMedia } from "../utils/media/downloadWhatsAppMedia.js";
import { processExcelToChangeLeadStatus } from "../utils/excel/processExcelToChangeLeadStatus.js";

export const vendorsFunctionsMiddleware = async (req, res, next) => {
	const body = req.body;
	let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages?.[0]
		?.type
		? body.entry[0].changes[0].value.messages[0].type
		: body.entry[0].changes[0];
	const userPhone = body.entry[0].changes[0]?.value?.messages?.[0]?.from
		? body.entry[0].changes[0].value.messages[0].from
		: "";
	let vendor = false;

	// Teléfono de los vendedores
	const vendor1 = process.env.PHONE_GUSTAVO_GLUNZ;
	const vendor2 = process.env.PHONE_GUSTAVO_GOMEZ_VILLAFANE;
	const vendor3 = process.env.JOANA;

	// Determiar si es un vendedor
	if (userPhone === vendor1 || userPhone === vendor2 || userPhone === vendor) {
		vendor = true;
	}

	// Check de que msje sea del vendedor y de tipo texto o documento (para cuando manden excel)
	if (
		(typeOfWhatsappMessage === "text" && vendor === true) ||
		(typeOfWhatsappMessage === "document" && vendor === true)
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

			const notification = `*🔔 Notificación automática:*\n❌ Los vendedores solo pueden enviar mensajes de Texto, responder a un Flow para tomar un lead o enviar un Excel para cambiar el estado.`;

			await handleWhatsappMessage(userPhone, notification);
		}

		// ---- Funciones disponibles para los vendedores -------------------------------
		if (message === "leads" && typeOfWhatsappMessage === "text") {
			// Función que envía excel con los leads en la fila del vendedor
			res.status(200).send("EVENT_RECEIVED");

			// Notificar al vendedor del proceso
			const message = `*🔔 Notificación Automática:*\n\n✅ Vas a recibir tus Leads en un Excel. El proceso a veces puede tardar pero volvé a enviar la palabra leads si ves que no llega.\n\nMegamoto`
			await handleWhatsappMessage(userPhone, message)
			
			// Se buscan todos los leads a atender
			const allLeads = await findFlowLeadsForVendors();
			
			// Chequea que haya más de 1 registro
			if (allLeads.length > 0) {
				// Filtra leads del vendor_phone
				const vendorLeads = allLeads.filter((lead) => {
					return lead.lastFlow.vendor_phone === parseInt(userPhone);
				});
				console.log(`Leads en la Fila de ${userPhone}:`, vendorLeads.length);
				
				// Genera un Excel con los datos
				const excelFile = await exportFlowLeadsToExcel(vendorLeads);
				console.log("excel:", excelFile); 
				
				// Se envía el Excel por WhatsApp
				await sendExcelByWhatsApp(userPhone, excelFile, "Leads");
				
			} else {
				// Como no hay Leads en la fila notificar al vendedor
				const message = `*🔔 Notificación Automática:*\n\n⚠️ Lamentablemente no hay Leads para atender.\n\nMegamoto`
				
				await handleWhatsappMessage(userPhone, message)

			}
		
		} else if (message === "lead" && typeOfWhatsappMessage === "text") {
			// Función que envía un lead para atender
			res.status(200).send("EVENT_RECEIVED");

			// Se buscan los leads a atender
			const allLeads = await findFlowLeadsForVendors();

			// Chequea que haya más de 1 registro
			if (allLeads.length > 0) {
				// Filtra leads donde vendor_phone esté vacío o no exista
				const availableLeads = allLeads.filter((lead) => {
					return !lead.lastFlow.vendor_phone;
				});
				//console.log("available leads:", availableLeads)

				if (availableLeads.length > 0) {
					// Llama función q toma el lead más viejo entre creación y toContact
					const oneLead = findOneLeadForVendor(availableLeads);
					const { myLead, flow_2Token } = oneLead;

					// Se notifica al vendedor por si no ve el Flow
					const notification =
						"*🔔 Notificación Automática:*\n✅ Se te está por enviar una Notificación para asignarte un Lead. Si estas en tu pc y no la ves entrá en WhatsApp desde tu celular.\n\nMegamoto";
					const vendorPhone = userPhone;

					await handleWhatsappMessage(vendorPhone, notification);

					// Se envía el FLOW 2 al vendedor
					await salesFlow_2Notification(myLead, vendorPhone, flow_2Token);
				} else {
					const vendorPhone = userPhone;
					const notification =
						"*🔔 Notificación Automática:*\n⚠️ Lamentablemente no hay Leads que atender.\nMegamoto";

					await handleWhatsappMessage(vendorPhone, notification);

					// A FUTURO GENERAR UNA ALARMA AL ADMIN!!
				}
			}
		} else if (message === "leads" && typeOfWhatsappMessage === "document" || message === "lead" && typeOfWhatsappMessage === "document") {
			// Función para que el vendedor envíe un Excel para cambiar estados
			res.status(200).send("EVENT_RECEIVED");
			console.log("entre acaaaaa")
			// Get the Document URL from WhatsApp
			const document = await getMediaWhatsappUrl(documentId);
			const documentUrl = document.data.url;

			// Download Document from WhatsApp
			const documentBuffer = await downloadWhatsAppMedia(documentUrl);
			const documentBufferData = documentBuffer.data;

			// Call the new function to process the campaign
			await processExcelToChangeLeadStatus(documentBufferData, userPhone);
		} else {
			next();
		}
	} else {
		next();
	}
};
