import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";
import { searchFlow_2Structure } from "./searchFlow_2Structure.js";
import axios from "axios"

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const appToken = process.env.WHATSAPP_APP_TOKEN;

export const salesFlow_2Notification = async ( myLead, vendorPhone) => {
	// URL where to post
	const url = `https://graph.facebook.com/v21.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

	try {
		// Search Flow structure for post request
		const flowStructure = searchFlow_2Structure(myLead);

		const { components, language } = flowStructure;

		// Payload for sending a template with an integrated flow
		const payload = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: vendorPhone,
			type: "template",
			template: {
				name: process.env.FLOW_2,
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


	} catch (error) {
		console.error(
			"Error in salesFlow_2Notification.js:",
			error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message
		);

		// Receives the throw new error && others
		await adminWhatsAppNotification(
			`*NOTIFICACION de Error de Flow en salesFlow_2Notification.js:*\n${
				error?.response?.data
					? JSON.stringify(error.response.data)
					: error.message
			}`
		);
	}
};
