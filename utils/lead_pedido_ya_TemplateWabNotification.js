import dotenv from "dotenv";
import axios from "axios";
import Leads from "../models/leads.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const lead_pedido_yaTemplateWabNotification = async (
	templateName,
	senderId
) => {
	
	try {
		// Look for lead in DB
		const lead = await Leads.findOne({
			id_user: senderId,
			$or: [
				{ thread_id: { $exists: true, $ne: "", $ne: null } },
				{ campaigns: { $exists: true, $ne: [] } },
			],
		});

		// Take last current Campaign - always the last one
		const currentCampaign = lead.campaigns[lead.campaigns.length - 1];

		// Prepare Template variables
		const campaignDate = new Date(
			currentCampaign.campaignDate
		).toLocaleDateString("es-AR");
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

		// Post the Notification to the vendor
		const response = await axios.post(url, messageData, {
			headers: { "Content-Type": "application/json" },
		});

		console.log("Notification sent to the vendor!!");
	} catch (error) {
		console.log(
			"Error in lead_pedido_yaTemplateWabNotification.js:",
			error.message
		);
		throw error;
	}
};
