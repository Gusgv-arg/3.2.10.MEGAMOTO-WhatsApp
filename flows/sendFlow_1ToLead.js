import axios from "axios";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";
import Leads from "../models/leads.js";
import { searchFlow_1Structure } from "./searchFlow_1Structure.js";
import { DeviceRequestPromptManager } from "puppeteer";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const appToken = process.env.WHATSAPP_APP_TOKEN;

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

export const sendFlow_1ToLead = async (userMessage) => {
	// URL where to post
	const url = `https://graph.facebook.com/v21.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

	// Search Flow structure for post request
	const flowStructure = searchFlow_1Structure(
		process.env.FLOW_1,
		userMessage.name
	);
	const { components, language } = flowStructure;

	// Payload for sending a template with an integrated flow
	const payload = {
		messaging_product: "whatsapp",
		recipient_type: "individual",
		to: userMessage.userPhone,
		type: "template",
		template: {
			name: process.env.FLOW_1,
			language: { code: language },
			components: components,
		},
	};

	try {
		// Post to the customer
		const response = await axios.post(url, payload, {
			headers: { "Content-Type": "application/json" },
		});

		//console.log("Id del whatsApp FLOW1 enviado:", response.data.messages[0].id)
		const wamId = response.data.messages[0].id
		return wamId
		
	} catch (error) {
		console.error(
			`Error en sendFlow_1ToLead.js:`,
			error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message
		);

		// Handle the Error
		// Looks existent lead
		let lead = await Leads.findOne({ id_user: userMessage.userPhone });

		// Update existing lead
		lead.flows[
			lead.flows.length - 1
		].messages += `${currentDateTime} MegaBot: NO se pudo enviar el Flow 1. Error: ${error.message}`;
		await lead.save();

		// Notify Error to the Admin
		const message = `*NOTIFICACION DE ERROR:* Hubo un error al enviar el Flow 1 al cliente ${userMessage.name}.\nError: ${error.message}`;
		await adminWhatsAppNotification(message);
	}
};
