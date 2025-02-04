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
import { exportFlowLeadsToExcel } from "../utils/excel/exportFlowLeadsToExcel.js";
import { sendExcelByWhatsApp } from "../utils/excel/sendExcelByWhatsApp.js";

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

		if (message === "megabot responder") {
			//Change general switch to ON
			await changeMegaBotSwitch("ON");

			// WhatsApp Admin notification
			await adminWhatsAppNotification(userPhone, botSwitchOnNotification);

			res.status(200).send("EVENT_RECEIVED");
		
		} else if (message === "megabot no responder") {
			//Change general switch to OFF
			await changeMegaBotSwitch("OFF");

			// WhatsApp Admin notification
			await adminWhatsAppNotification(userPhone, botSwitchOffNotification);

			res.status(200).send("EVENT_RECEIVED");
		
		} else if (message === "megabot") {
			// WhatsApp Admin notification
			await adminWhatsAppNotification(userPhone, helpFunctionNotification);

			res.status(200).send("EVENT_RECEIVED");
		
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
		
		} else if (message === "megabot listar campañas") {
			res.status(200).send("EVENT_RECEIVED");

			await listCampaigns(userPhone);
		
		} else if (message === "megabot campañas") {
			res.status(200).send("EVENT_RECEIVED");

			const leads = await exportCampaignsToExcel(userPhone);
		
		} else if (message === "megabot precios") {
			if (isScrapperCalled === false) {
				isScrapperCalled = true;
				res.status(200).send("EVENT_RECEIVED");
				const precios = await scrapeMercadoLibre(userPhone);
			} else {
				console.log("isScrapperCelles esta en:", isScrapperCalled);
				res.status(200).send("EVENT_RECEIVED");
			}
		
		} else if (message === "megabot facebook") {
			res.status(200).send("EVENT_RECEIVED");
			await scrapeFacebook(userPhone);
		
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
		
		} else if (message === "crear precios") {
			res.status(200).send("EVENT_RECEIVED");

			const notification = await pricesModelCreation();
					
		} else if (message === "leads1") {
			res.status(200).send("EVENT_RECEIVED");
			
			// Filtra de l BD los Leads disponibles para atender dentro del Flow 
			const queue = await findFlowLeadsForVendors();
			console.log("Queue", queue);

			// Genera un Excel con los datos 
			const excelFile = await exportFlowLeadsToExcel(queue)
			console.log("excel:", excelFile)

			// Se envía el Excel por WhatsApp
			await sendExcelByWhatsApp(userPhone, excelFile, "Leads")
		
		} else {
			// Does next if its an admin message but is not an instruction
			next();
		}
	} else {
		// Does next for any message that differs from text or is not sent by admin
		next();
	}
};
