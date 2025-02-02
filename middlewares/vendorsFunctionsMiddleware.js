import { handleWhatsappMessage } from "../utils/whatsapp/handleWhatsappMessage.js";
import { findFlowLeadsForVendors } from "../utils/dataBase/findFlowLeadsForVendors.js";
import { findOneLeadForVendor } from "../utils/dataBase/findOneLeadForVendor.js";
import { salesFlow_2Notification } from "../flows/salesFlow_2Notification.js";
import { exportFlowLeadsToExcel } from "../utils/excel/exportFlowLeadsToExcel.js";
import { sendExcelByWhatsApp } from "../utils/excel/sendExcelByWhatsApp.js";
import { getMediaWhatsappUrl } from "../utils/media/getMediaWhatsappUrl.js";
import { downloadWhatsAppMedia } from "../utils/media/downloadWhatsAppMedia.js";
import { processExcelToChangeLeads } from "../utils/excel/processExcelToChangeLeads.js";
import { exportFlowLeadsToTemplate } from "../utils/excel/exportFlowLeadsToTemplate.js";
import { exportFlowLeadsToTemplate2 } from "../utils/excel/exportFlowLeadsToTemplate2.js";
import { exportFlowLeadsToTemplate3 } from "../utils/excel/exportFlowLeadsToTemplate3.js";
import { exportFlowLeadsToProtectedExcel } from "../utils/excel/exportFlowLeadsToProtectedExcel.js";

export const vendorsFunctionsMiddleware = async (req, res, next) => {
	const body = req.body;
	const name = body.entry[0].changes[0].value.contacts[0].profile.name;
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
	const vendor3 = process.env.JOANA;
	let vendorName;

	// Determiar si es un vendedor
	if (userPhone === vendor1 || userPhone === vendor2 || userPhone === vendor3) {
		vendor = true;
		// Nombre del vendedor
		vendorName =
			userPhone === vendor1
				? "G. Glunz"
				: userPhone === vendor2
				? "G. G.Villafañe"
				: userPhone === vendor3
				? "Joana"
				: "";
	}

	// Check del tipo de msje
	if (typeOfWhatsappMessage !== "text" && vendor === false) {
		// El Lead manda mensaje que NO sea texto

		res.status(200).send("EVENT_RECEIVED");

		const notification = `*🔔 Notificación Automática:*\n\n❗ Estimado /a ${name}, esta es una línea de WhatsApp que *solo procesa mensajes de texto* y sirve para que los vendedores puedan atenderte más rápido.\n\n*¡Tu moto está más cerca en MEGAMOTO!*`;

		await handleWhatsappMessage(userPhone, notification);
	} else if (
		typeOfWhatsappMessage !== "text" &&
		typeOfWhatsappMessage !== "document" &&
		typeOfWhatsappMessage !== "interactive" &&
		vendor === true
	) {
		res.status(200).send("EVENT_RECEIVED");

		const notification = `*🔔 Notificación Automática:*\n\n❌ ${vendorName}, los vendedores solo pueden:\n1. Enviar palabra "lead" para recibir un Lead.\n2. Enviar palabra "leads" para recibir un excel con sus leads.\n3. Adjuntar el mismo excel recibido más la palabra "leads" para modificar información (estado, etc).\n4. Responder al Formulario recibido para tomar un lead.\n\n*Megamoto*`;

		await handleWhatsappMessage(userPhone, notification);
	} else if (
		(typeOfWhatsappMessage === "text" && vendor === true) ||
		(typeOfWhatsappMessage === "document" && vendor === true) ||
		(typeOfWhatsappMessage === "interactive" && vendor === true)
	) {
		let message;
		let documentId;

		if (typeOfWhatsappMessage === "text") {
			message =
				body.entry[0].changes[0].value.messages[0].text.body.toLowerCase();

			if (
				message !== "lead" &&
				message !== "leads" &&
				userPhone !== vendor1 &&
				userPhone !== vendor2
			) {
				// Caso que el vendedor manda un texto con algo que la API no procesa
				res.status(200).send("EVENT_RECEIVED");

				const notification = `*🔔 Notificación Automática:*\n\n❌ ${vendorName}, los vendedores solo pueden:\n1-Enviar la palabra "lead" para recibir un Lead.\n2-Enviar la palabra "leads" para recibir un excel con sus leads.\n3-Adjuntar el excel recibido más la palabra "leads" para modificar información (estado, etc).\n\n*Megamoto*`;

				await handleWhatsappMessage(userPhone, notification);
			}
		} else if (typeOfWhatsappMessage === "document") {
			message =
				body.entry[0].changes[0].value.messages[0].document.caption.toLowerCase();
			documentId = body.entry[0].changes[0].value.messages[0].document.id;

			if (message !== "lead" && message !== "leads") {
				// Caso que el vendedor manda el excel y no pone "leads"

				res.status(200).send("EVENT_RECEIVED");

				const notification = `*🔔 Notificación Automática:*\n\n❌ ${vendorName}, al enviar el Excel con tus leads por favor coloca la palabra "leads".\n\n*Megamoto*`;

				await handleWhatsappMessage(userPhone, notification);
			}
		} else if (typeOfWhatsappMessage === "interactive") {
			// Hace next si es un vendedor y es un Flow
			next();
		}

		// ---- Funciones disponibles para los vendedores -------------------------------
		if (message === "leads" && typeOfWhatsappMessage === "text") {
			// Función que envía excel con los leads en la fila del vendedor
			res.status(200).send("EVENT_RECEIVED");

			
			// Se buscan todos los leads a atender
			const allLeads = await findFlowLeadsForVendors();
			console.log("allLeads:", allLeads);
			
			// Chequea que haya más de 1 registro
			if (allLeads.length > 0) {
				let available = true;
				const availableLeads = allLeads.reduce(
					(count, lead) => (!lead.lastFlow.vendor_phone ? count + 1 : count),
					0
				);
				if (availableLeads === 0) {
					available = false;
				}
				
				console.log("Leads sin vendedor asignado:", availableLeads);
				
				let vendorLeads;
				
				if (vendorName !== "G. Glunz") {
					// Filtra leads del vendor_phone salvo G.Glunz que ve todos los Leads
					vendorLeads = allLeads.filter((lead) => {
						return lead.lastFlow.vendor_phone === parseInt(userPhone);
					});
				} else {
					vendorLeads = allLeads;
				}
				console.log(`Leads en la Fila de ${userPhone}:`, vendorLeads.length);
				
				// Procesa solo los leads del vendedor
				if (vendorLeads.length > 0) {
					// Notificar al vendedor del proceso
					const message = `*🔔 Notificación Automática:*\n\n✅ Vas a recibir tus Leads en un Excel. Si no llega en menos de 1 minuto, volvé a enviar la palabra leads.\n\n*Megamoto*`;
					
					await handleWhatsappMessage(userPhone, message);
					
					// Genera un Excel con los datos
					//const excelFile = await exportFlowLeadsToProtectedExcel(vendorLeads);
					//const excelFile = await exportFlowLeadsToExcel(vendorLeads);
					const excelFile = await exportFlowLeadsToTemplate3(vendorLeads);
					//console.log("excel:", excelFile);

					// Se envía el Excel por WhatsApp con el nombre del vendedor
					const fileName = `Leads ${vendorName}`;
					await sendExcelByWhatsApp(userPhone, excelFile, fileName);
					
				} else {
					// Como no hay Leads en la fila del VENDEDOR se lo notifica
					let message
					if (available === true){
						message = `*🔔 Notificación Automática:*\n\n⚠️ No tenés Leads que estés atendiendo. Hay *${availableLeads}* leads para atender asique enviá la palabra "lead" para que se te asigne uno. ¡A vender!\n\n*Megamoto*`;

					} else {
						message = `*🔔 Notificación Automática:*\n\n⚠️ No tenés Leads que estés atendiendo y por el momento no hay leads disponibles para atender.\n\n*Megamoto*`
					}

					await handleWhatsappMessage(userPhone, message);
				}
			} else {
				// Como no hay Leads en la fila notificar al vendedor
				const message = `*🔔 Notificación Automática:*\n\n⚠️ No hay Leads de ningún vendedor que estén pendientes.\n\n*Megamoto*`;

				await handleWhatsappMessage(userPhone, message);
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
					//console.log("myLead:", myLead)

					// Se notifica al vendedor por si no ve el Flow
					const notification =
						"*🔔 Notificación Automática:*\n\n✅ Entrá en tu celular para tomar un Lead.\n\n*Megamoto*";
					const vendorPhone = userPhone;

					await handleWhatsappMessage(vendorPhone, notification);

					// Se envía el FLOW 2 al vendedor
					await salesFlow_2Notification(myLead, vendorPhone, flow_2Token);
				} else {
					const vendorPhone = userPhone;
					const notification =
						"*🔔 Notificación Automática:*\n\n⚠️ Por el momento no hay Leads que atender.\n\n*Megamoto*";

					await handleWhatsappMessage(vendorPhone, notification);
					
					// A FUTURO GENERAR UNA ALARMA AL ADMIN!!
				}
			} else {
				const vendorPhone = userPhone;
				const notification =
					"*🔔 Notificación Automática:*\n\n⚠️ Lamentablemente no hay Leads que atender.\n\n*Megamoto*";

				await handleWhatsappMessage(vendorPhone, notification);

			}
		
		} else if (
			(message === "leads" && typeOfWhatsappMessage === "document") ||
			(message === "lead" && typeOfWhatsappMessage === "document")
		) {
			// Función para que el vendedor envíe un Excel para cambiar estados
			res.status(200).send("EVENT_RECEIVED");

			// Get the Document URL from WhatsApp
			const document = await getMediaWhatsappUrl(documentId);
			const documentUrl = document.data.url;

			// Download Document from WhatsApp
			const documentBuffer = await downloadWhatsAppMedia(documentUrl);
			const documentBufferData = documentBuffer.data;

			// Call the new function to process the campaign
			await processExcelToChangeLeads(documentBufferData, userPhone);
		} else {
			next();
		}
	} else {
		next();
	}
};
