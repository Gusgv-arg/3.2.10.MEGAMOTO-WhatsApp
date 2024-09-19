import dotenv from "dotenv";
import { changeMegaBotSwitch } from "../functions/changeMegaBotSwitch.js";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";
import {
	botSwitchOffNotification,
	botSwitchOnNotification,
	helpFunctionNotification,
	templateError,
} from "../utils/notificationMessages.js";
import { getMediaWhatsappUrl } from "../utils/getMediaWhatsappUrl.js";
import { downloadWhatsAppMedia } from "../utils/downloadWhatsAppMedia.js";
import { processCampaignExcel } from "../functions/processCampaignExcel.js";
import { changeCampaignStatus } from "../utils/changeCampaignStatus.js";
import listCampaigns from "../utils/listCampaigns.js";
import { exportLeadsToExcel } from "../utils/exportLeadsToExcel.js";
import { processPedidoYa } from "../functions/processPedidoYa.js";

const myPhone = process.env.MY_PHONE;
const myPhone2 = process.env.MY_PHONE2;

export const adminFunctionsMiddleware = async (req, res, next) => {
	const body = req.body;
	let channel = body.entry[0].changes ? "WhatsApp" : "Other";
	let status = body?.entry?.[0].changes?.[0].value?.statuses?.[0]
		? "status"
		: null;

	// Return if I receive status update
	if (status !== null) {
		res.status(200).send("EVENT_RECEIVED");
		return;
	}

	// Check if its WhatsApp text message from Admin phone
	if (channel === "WhatsApp" && body?.entry[0]) {
		let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages[0]
			?.type
			? body.entry[0].changes[0].value.messages[0].type
			: "other type";
		const userPhone = body.entry[0].changes[0].value.messages[0].from;

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

				// Get the Document URL from WhatsApp
				const document = await getMediaWhatsappUrl(documentId);
				const documentUrl = document.data.url;
				//console.log("Document URL:", documentUrl);

				// Download Document from WhatsApp
				const documentBuffer = await downloadWhatsAppMedia(documentUrl);
				const documentBufferData = documentBuffer.data;
				//console.log("Document download:", documentBufferData);

				// Call the new function to process the campaign
				if (campaignName === "pedido ya") {
					await processPedidoYa(
						documentBufferData,
						templateName,
						campaignName,
						userPhone
					);
				} else {
					await processCampaignExcel(
						documentBufferData,
						templateName,
						campaignName,
						userPhone
					);
				}

				res.status(200).send("EVENT_RECEIVED");
			} else if (message.startsWith("inactivar")) {
				const parts = message.split(" ");
				const campaignName = parts.slice(1).join("_");

				//Call the functions that inactivates Campaign
				await changeCampaignStatus("inactiva", campaignName, userPhone);

				res.status(200).send("EVENT_RECEIVED");
			} else if (message.startsWith("activar")) {
				const parts = message.split(" ");
				const campaignName = parts.slice(1).join("_");

				//Call the functions that activates Campaign
				await changeCampaignStatus("activa", campaignName, userPhone);

				res.status(200).send("EVENT_RECEIVED");
			} else if (message === "megabot campañas") {
				await listCampaigns(userPhone);

				res.status(200).send("EVENT_RECEIVED");
			} else if (message === "megabot leads") {
				const leads = await exportLeadsToExcel(userPhone);

				res.status(200).send("EVENT_RECEIVED");
			} else {
				// Does next if its an admin message but is not an instruction
				next();
			}
		} else {
			// Does next for any message that differs from text or is not sent by admin
			next();
		}
	} else {
		next();
	}
};
