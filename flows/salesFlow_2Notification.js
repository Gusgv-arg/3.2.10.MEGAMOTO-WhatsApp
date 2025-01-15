import Leads from "../models/leads.js";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";
import { searchFlow_2Structure } from "./searchFlow_2Structure.js";
import axios from "axios"

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const appToken = process.env.WHATSAPP_APP_TOKEN;
const templateName = process.env.FLOW_2;


export const salesFlow_2Notification = async (customerPhone, notification, vendorPhone) => {
	// URL where to post
	const url = `https://graph.facebook.com/v21.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

	try {
		// Search Flow structure for post request
		const flowStructure = searchFlow_2Structure(
			templateName,
			customerPhone,
			notification
		);
		const { components, language, flowToken } = flowStructure;

		// Payload for sending a template with an integrated flow
		const payload = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: vendorPhone,
			type: "template",
			template: {
				name: templateName,
				language: { code: language },
				components: components,
			},
		};

		// Post to the customer
		const response = await axios.post(url, payload, {
			headers: { "Content-Type": "application/json" },
		});
		console.log(
			`Plantilla de Notificación al Vendedor enviada al número: ${vendorPhone}`
		);

		// Obtain current date and hour
		const currentDateTime = new Date().toLocaleString("es-AR", {
			timeZone: "America/Argentina/Buenos_Aires",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});

		// Looks existent lead
		let lead = await Leads.findOne({ id_user: customerPhone });

		// Take last Flow record
		let currentFlow = lead.flows[lead.flows.length - 1];

		// Change Client Status and History && save flow token and vendor phone
		currentFlow.client_status = "transferido al vendedor",
		currentFlow.history += `${currentDateTime}: Status Cliente: Transferido al Vendedor ${vendorPhone}. `,
		currentFlow.flow_token = flowToken
		currentFlow.vendor_phone = vendorPhone

		// Update lead
		await lead.save();
		console.log(
			"Lead updated with changed client_status to Transferido al Vendedor"
		);
		return;
	} catch (error) {
		console.error(
			"Error in salesFlowNotification.js:",
			error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message
		);

		// Receives the throw new error && others
		await adminWhatsAppNotification(
			`*NOTIFICACION de Error de Plantilla en salesFlowNotification.js:*\n${
				error?.response?.data
					? JSON.stringify(error.response.data)
					: error.message
			}`
		);
	}
};
