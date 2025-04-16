import { changeMegaBotSwitch } from "../functions/changeMegaBotSwitch.js";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";
import {
	botSwitchOffNotification,
	botSwitchOnNotification,
	helpFunctionNotification,
	inexistingTemplate,
	templateError,
} from "../utils/notifications/notificationMessages.js";
import { getMediaWhatsappUrl } from "../utils/media/getMediaWhatsappUrl.js";
import { downloadWhatsAppMedia } from "../utils/media/downloadWhatsAppMedia.js";
import { changeCampaignStatus } from "../utils/campaigns/changeCampaignStatus.js";
import listCampaigns from "../utils/campaigns/listCampaigns.js";
import { exportCampaignsToExcel } from "../utils/excel/exportCampaignsToExcel.js";
import { processPedidoYa } from "../functions/processPedidoYa.js";
import { scrapeMercadoLibre } from "../functions/scrapeMercadoLibre.js";
import { scrapeFacebook } from "../functions/scrapeFacebook.js";
import { processTemplateExcel } from "../functions/processTemplateExcel.js";
import { pricesModelCreation } from "../utils/dataBase/pricesModelCreation.js";
import { updateDbPricesFromExcel } from "../utils/dataBase/updatesDbPricesFromExcel.js";
import { findFlowLeadsForVendors } from "../utils/dataBase/findFlowLeadsForVendors.js";
import { sendExcelByWhatsApp } from "../utils/excel/sendExcelByWhatsApp.js";
import { handleWhatsappMessage } from "../utils/whatsapp/handleWhatsappMessage.js";
import { exportFlowLeadsToTemplate } from "../utils/excel/exportFlowLeadsToTemplate.js";
import { changeAlarmSwitch } from "../functions/changeAlarmSwitch.js";
import { leadsStatusAnalysis } from "../utils/dataBase/leadsStatusAnalysis.js";

const myPhone = process.env.MY_PHONE;
const myPhone2 = process.env.MY_PHONE2;

export const adminFunctionsMiddleware = async (req, res, next) => {
	const body = req.body;
	let isScrapperCalled = false;
	let channel = body.entry[0].changes ? "WhatsApp" : "Other";
	let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages?.[0]
		?.type
		? body.entry[0].changes[0].value.messages[0].type
		: body.entry[0].changes[0];
	const userPhone = body.entry[0].changes[0]?.value?.messages?.[0]?.from
		? body.entry[0].changes[0].value.messages[0].from
		: "";

	// Admin INSTRUCTIONS: can be text or document format in case of Campaign!!!
	if (
		(typeOfWhatsappMessage === "text" && userPhone === myPhone) ||
		(typeOfWhatsappMessage === "document" && userPhone === myPhone) ||
		(typeOfWhatsappMessage === "text" && userPhone === myPhone2) ||
		(typeOfWhatsappMessage === "document" && userPhone === myPhone2)
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
		}

		if (message === "responder") {
			res.status(200).send("EVENT_RECEIVED");

			//Change general switch to ON
			await changeMegaBotSwitch("ON");

			// WhatsApp Admin notification
			await adminWhatsAppNotification(userPhone, botSwitchOnNotification);

			console.log(`${userPhone} prendió la API.`);
		} else if (message === "no responder") {
			res.status(200).send("EVENT_RECEIVED");

			//Change general switch to OFF
			await changeMegaBotSwitch("OFF");

			// WhatsApp Admin notification
			await adminWhatsAppNotification(userPhone, botSwitchOffNotification);

			console.log(`${userPhone} apagó la API.`);
		} else if (message === "alarma") {
			res.status(200).send("EVENT_RECEIVED");
			// Función para que me llegue una notificación cuando entra un nuevo lead
			const alarm = await changeAlarmSwitch();

			const message = `*🔔 Notificación:*\n\nLa alarma de nuevos leads fue puesta en *${alarm}*.\n\nMegamoto`;

			await adminWhatsAppNotification(userPhone, message);
		} else if (message === "megamoto") {
			res.status(200).send("EVENT_RECEIVED");
			// WhatsApp Admin notification
			await adminWhatsAppNotification(userPhone, helpFunctionNotification);

			console.log(
				`${userPhone} envío la palabra Megamoto y recibió las funciones disponibles.`
			);
		} else if (message === "status") {
			res.status(200).send("EVENT_RECEIVED");

			const status = await leadsStatusAnalysis();

			// WhatsApp Admin notification
			await adminWhatsAppNotification(userPhone, status);

			console.log(
				`${userPhone} envío la palabra status y recibió el estado de los leads.`
			);
		} else if (message.startsWith("campaña")) {
			// Campaigns format: "campaña" "template name" "campaign name"
			const parts = message.split(" ");
			const templateName = parts[1];
			const campaignName = parts.slice(2).join("_");
			let documentBufferData;

			if (typeOfWhatsappMessage === "document") {
				// Get the Document URL from WhatsApp
				const document = await getMediaWhatsappUrl(documentId);
				const documentUrl = document.data.url;
				//console.log("Document URL:", documentUrl);

				// Download Document from WhatsApp
				const documentBuffer = await downloadWhatsAppMedia(documentUrl);
				documentBufferData = documentBuffer.data;
				//console.log("Document download:", documentBufferData);
			}

			// Check Template && excecute specific function
			if (templateName === "pedido_ya_dni_no_calificados") {
				// Call the new function to process the campaign "pedido ya"
				await processPedidoYa(
					documentBufferData,
					templateName,
					campaignName,
					userPhone
				);
			} else {
				// WhatsApp Admin notification of non existing Template
				const notification = `${inexistingTemplate} ${templateName}.`;
				await adminWhatsAppNotification(userPhone, notification);
			}

			res.status(200).send("EVENT_RECEIVED");
		} else if (message.startsWith("inactivar")) {
			const parts = message.split(" ");
			const campaignName = parts.slice(1).join("_");

			//Call the functions that inactivates Campaign
			res.status(200).send("EVENT_RECEIVED");
			await changeCampaignStatus("inactiva", campaignName, userPhone);
		} else if (message.startsWith("activar")) {
			const parts = message.split(" ");
			const campaignName = parts.slice(1).join("_");

			//Call the functions that activates Campaign
			res.status(200).send("EVENT_RECEIVED");
			await changeCampaignStatus("activa", campaignName, userPhone);
		} else if (message === "listar campañas") {
			res.status(200).send("EVENT_RECEIVED");

			await listCampaigns(userPhone);
		} else if (message === "campañas") {
			res.status(200).send("EVENT_RECEIVED");

			const leads = await exportCampaignsToExcel(userPhone);
		} else if (message === "precios") {
			if (isScrapperCalled === false) {
				isScrapperCalled = true;
				res.status(200).send("EVENT_RECEIVED");
				const precios = await scrapeMercadoLibre(userPhone);

				console.log(
					`${userPhone} recibió el excel con los precios de Mercado Libre.`
				);
			} else {
				//console.log("isScrapperCelles esta en:", isScrapperCalled);
				res.status(200).send("EVENT_RECEIVED");
			}
		} else if (message === "facebook") {
			res.status(200).send("EVENT_RECEIVED");
			await scrapeFacebook(userPhone);

			console.log(
				`${userPhone} recibió el excel con los avisos de Facebook de la competencia.`
			);
			
		} else if (message.startsWith("plantilla")) {
			res.status(200).send("EVENT_RECEIVED");

			// Template format: "plantilla" "template name"
			const parts = message.split(" ");
			const templateName = parts[1];
			const campaignName = parts.slice(2).join("_");

			// Get the Document URL from WhatsApp
			const document = await getMediaWhatsappUrl(documentId);
			const documentUrl = document.data.url;
			//console.log("Document URL:", documentUrl);

			// Download Document from WhatsApp
			const documentBuffer = await downloadWhatsAppMedia(documentUrl);
			const documentBufferData = documentBuffer.data;
			//console.log("Document download:", documentBufferData);

			// Call the new function to process the campaign
			await processTemplateExcel(
				documentBufferData,
				templateName,
				campaignName
			);
		} else if (message === "actualizar precios") {
			res.status(200).send("EVENT_RECEIVED");

			const notification = await updateDbPricesFromExcel();

			await adminWhatsAppNotification(userPhone, notification);

			console.log(`${userPhone} corrió la actualización de precios.`);
		} else if (message === "crear precios") {
			res.status(200).send("EVENT_RECEIVED");

			const notification = await pricesModelCreation();
		} else if (message === "flows") {
			res.status(200).send("EVENT_RECEIVED");

			// Filtra de la BD los Leads disponibles para atender dentro del Flow
			const queue = await findFlowLeadsForVendors();
			//console.log("Queue", queue);

			// Chequea que haya leads en la fila
			if (queue.length > 0) {
				// Genera un Excel con los datos
				const excelFile = await exportFlowLeadsToTemplate(queue);
				//console.log("excel:", excelFile);

				// Se envía el Excel por WhatsApp
				await sendExcelByWhatsApp(userPhone, excelFile, "Leads");

				console.log(`Admin ${userPhone} recibió un excel con los leads.`);
			} else {
				const message = `*🔔 Notificación MEGAMOTO:*\n\n⚠️ No hay Leads de ningún vendedor que estén pendientes.\n\n*Megamoto*`;

				// Se notifica de que no hay Leads
				await handleWhatsappMessage(userPhone, message);

				console.log(
					`Admin ${userPhone} recibió un mensaje de que no hay leads x lo que no recibió el excel.`
				);
			}
		} else {
			// Does next if its an admin message but is not an instruction
			next();
		}
	} else {
		// Does next for any message that differs from text or is not sent by admin
		next();
	}
};
