import dotenv from "dotenv";
import axios from "axios";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

// Notifies by whatsApp using a template
export const templateWhatsAppNotification = async (
	templateName,
	vendor_phone,
	parameters
) => {
	console.log("template:", templateName);
	console.log("telefono vendedor:", vendor_phone);
	console.log("variables:", parameters);
	try {
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
		console.log("Error in templateWhatsAppNotification.js:", error.message);
		throw error;
	}
};
