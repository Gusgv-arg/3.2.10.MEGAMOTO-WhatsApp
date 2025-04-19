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
			: typeOfWhatsappMessage === "interactive"
			? body.entry[0].changes[0].value.messages[0].interactive.nfm_reply
					.response_json
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
	console.log("Vendedor:", vendorName);

	// Check del tipo de msje
	if (typeOfWhatsappMessage !== "text" && vendor === false) {
		// El usuario NO es un Vendedor y manda mensaje que NO sea texto

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
			const notification = `*🔔 Notificación MEGAMOTO:*\n\n☰ Entrá a tu celular para ver el *Menú de Vendedor*.\n\n*Megamoto*`;

			await handleWhatsappMessage(userPhone, notification);

			await sendMenuToVendor(userPhone);
		} else if (typeOfWhatsappMessage === "interactive") {
			console.log("detecto interactive");
			if (message.includes('"0_1-Tomar_Lead"')) {
				console.log("Entró a tomar lead");
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
						const notification = `*🔔 Notificación MEGAMOTO:*\n\n✅ Entrá en tu celular para tomar un Lead. Hay ${availableLeads.length} leads esperando.\n\n*Megamoto*`;
						const vendorPhone = userPhone;

						await handleWhatsappMessage(vendorPhone, notification);

						// Se envía el FLOW 2 al vendedor
						await salesFlow_2Notification(myLead, vendorPhone, flow_2Token);

						console.log(
							`El vendedor ${vendorName} solicitó tomar un lead y se le envio el FLOW 2 con el lead: ${myLead}.`
						);
					} else {
						const vendorPhone = userPhone;
						const notification =
							"*🔔 Notificación MEGAMOTO:*\n\n⚠️ Por el momento no hay Leads que atender.\n\n*Megamoto*";

						await handleWhatsappMessage(vendorPhone, notification);

						console.log(
							`El vendedor ${vendorName} recibió un mensaje de que no hay leads para atender.`
						);
						// A FUTURO GENERAR UNA ALARMA AL ADMIN!!
					}
				} else {
					const vendorPhone = userPhone;
					const notification =
						"*🔔 Notificación MEGAMOTO:*\n\n⚠️ Por el momento no hay Leads que atender.\n\n*Megamoto*";

					await handleWhatsappMessage(vendorPhone, notification);

					console.log(
						`El vendedor ${vendorName} recibió un mensaje de que no hay leads para atender.`
					);
				}
			} else if (message.includes('"1_2-Excel_con_mis_Leads"')) {
				// Se buscan todos los leads a atender
				const allLeads = await findFlowLeadsForVendors();
				//console.log("allLeads:", allLeads);

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

					//console.log("Leads sin vendedor asignado:", availableLeads);

					// Filtra leads del vendor_phone
					const vendorLeads = allLeads.filter((lead) => {
						return lead.lastFlow.vendor_phone === parseInt(userPhone);
					});

					//console.log(`Leads en la Fila de ${userPhone}:`, vendorLeads.length);
					//console.log("vendorLeads:", vendorLeads);

					// Procesa solo los leads del vendedor
					if (vendorLeads.length > 0) {
						// Notificar al vendedor del proceso
						const message = `*🔔 Notificación MEGAMOTO:*\n\n✅ Vas a recibir tus Leads en un Excel. Al abrir el archivo NO le des importancia a los mensajes de error. Si no llega en menos de 1 minuto, volvé a enviar la palabra leads.\n\n*Megamoto*`;

						await handleWhatsappMessage(userPhone, message);

						// Genera un Excel con los datos
						const excelFile = await exportFlowLeadsToTemplate(vendorLeads);

						// Se envía el Excel por WhatsApp con el nombre del vendedor
						const fileName = `Leads ${vendorName}`;
						await sendExcelByWhatsApp(userPhone, excelFile, fileName);

						console.log(
							`El vendedor ${vendorName} recibió el excel con sus leads.`
						);
					} else {
						// Como no hay Leads en la fila del VENDEDOR se lo notifica
						let message;
						if (available === true) {
							message = `*🔔 Notificación MEGAMOTO:*\n\n⚠️ No tenés Leads que estés atendiendo. Hay *${availableLeads}* leads para atender asique enviá la palabra "lead" para que se te asigne uno. ¡A vender!\n\n*Megamoto*`;

							console.log(
								`El vendedor ${vendorName} recibió un mensaje de que envíe la palabra lead para atender a alguien.`
							);
						} else {
							message = `*🔔 Notificación MEGAMOTO:*\n\n⚠️ No tenés Leads que estés atendiendo y por el momento no hay leads disponibles para atender.\n\n*Megamoto*`;

							console.log(
								`El vendedor ${vendorName} recibió un mensaje de que NO tiene y de que NO hay leads para atender.`
							);
						}

						await handleWhatsappMessage(userPhone, message);
					}
				} else {
					// Como no hay Leads en la fila notificar al vendedor
					const message = `*🔔 Notificación MEGAMOTO:*\n\n⚠️ No hay Leads de ningún vendedor que estén pendientes.\n\n*Megamoto*`;

					await handleWhatsappMessage(userPhone, message);

					console.log(
						`El vendedor ${vendorName} recibió un mensaje de que NO hay leads pendientes de nadie.`
					);
				}
			}
		} else if (typeOfWhatsappMessage === "document") {
			// Función para que el vendedor envíe un Excel para cambiar datos (estados, etc)
			let documentId = body.entry[0].changes[0].value.messages[0].document.id;

			// Get the Document URL from WhatsApp
			const document = await getMediaWhatsappUrl(documentId);
			const documentUrl = document.data.url;

			// Download Document from WhatsApp
			const documentBuffer = await downloadWhatsAppMedia(documentUrl);
			const documentBufferData = documentBuffer.data;

			// Call the function to process the excel
			await processExcelToChangeLeads(
				documentBufferData,
				userPhone,
				vendorName
			);
		}
	} else {
		next();
	}
};
