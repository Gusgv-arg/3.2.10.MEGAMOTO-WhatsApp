import axios from "axios";
import { adminWhatsAppNotification } from "./adminWhatsAppNotification.js";
import Leads from "../../models/leads.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const myPhone = process.env.MY_PHONE;

export const leadTemplateWabNotification = async (templateName, senderId) => {
	let lead;
	let currentCampaign;
	let campaignDate;

	try {
		// Look for lead in DB
		lead = await Leads.findOne({
			id_user: senderId,
			$or: [
				{ thread_id: { $exists: true, $ne: "", $ne: null } },
				{ campaigns: { $exists: true, $ne: [] } },
			],
		});

		// Take last current Campaign - always the last one
		currentCampaign = lead.campaigns[lead.campaigns.length - 1];

		// Prepare Template variables
		campaignDate = new Date(currentCampaign.campaignDate).toLocaleDateString(
			"es-AR"
		);
		const vendor_phone = currentCampaign.vendor_phone;

		// Clean the messages to remove new lines and excessive spaces
		const cleanMessages = currentCampaign.messages
			.replace(/[\n\t]+/g, " ")
			.replace(/ {2,}/g, " ");

		// Create parameters for the Template
		const parameters = [
			{ type: "text", text: currentCampaign.campaignName },
			{ type: "text", text: campaignDate },
			{ type: "text", text: lead.name },
			{ type: "text", text: lead.id_user },
			{ type: "text", text: currentCampaign.client_status },
			{ type: "text", text: currentCampaign.payment },
			{ type: "text", text: cleanMessages },
		];

		// URL where to post the Template message
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

		const messageData = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: vendor_phone.toString(),
			type: "template",
			template: {
				name: templateName,
				language: {
					code: "es_AR",
				},
				components: [
					{
						type: "body",
						parameters: parameters,
					},
				],
			},
		};
		//console.log("MessageData--->", messageData)
		//console.log("Parameters:", parameters)

		// Post the Notification to the vendor
		const response = await axios.post(url, messageData, {
			headers: { "Content-Type": "application/json" },
		});
		
	} catch (error) {
		console.log(
			"Error in leadTemplateWabNotification.js:",
			error.message,
			"wile sending notification from:",
			lead.name
		);

		// Change status of client
		currentCampaign.client_status = "vendedor no notificado";
		await lead.save();

		// Notify the Admin so he can resend the message to the vendor
		const leadNotification = `*LEAD NO INFORMADO AL VENDEDOR - Reenviar al ${currentCampaign.vendor_phone}:*\n*Nombre de la Campaña:* ${currentCampaign.campaignName}\n*Fecha de la Campaña:* ${campaignDate}\n*Cliente:* ${lead.name}\n*Teléfono:* ${lead.id_user}\n*Método de Pago:* ${currentCampaign.payment}\n*Conversación:* ${currentCampaign.messages}`;

		await adminWhatsAppNotification(myPhone, leadNotification);
	}
};
