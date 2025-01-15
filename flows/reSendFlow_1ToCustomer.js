import axios from "axios";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";
import Leads from "../models/leads.js";
import { searchFlow_1Structure } from "./searchFlow_1Structure.js";


const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const appToken = process.env.WHATSAPP_APP_TOKEN;

export const reSendFlow_1ToCustomer = async (senderId, flowName, name) => {
	// URL where to post
	const url = `https://graph.facebook.com/v21.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

	// Variables to track
	let flowThreadId = "";

	// Search Flow structure for post request
	const flowStructure = searchFlow_1Structure(flowName, name);
	const { components, language } = flowStructure;

	// Payload for sending a template with an integrated flow
	const payload = {
		messaging_product: "whatsapp",
		recipient_type: "individual",
		to: senderId,
		type: "template",
		template: {
			name: flowName,
			language: { code: language },
			components: components,
		},
	};

	//console.log("Data final para el POST:", JSON.stringify(payload, null, 2));

	try {
		// Post to the customer
		const response = await axios.post(url, payload, {
			headers: { "Content-Type": "application/json" },
		});
		console.log(`Flow enviado a ${senderId}: ${response.data.messages[0].id}`);

		// Looks existent lead
		let lead = await Leads.findOne({ id_user: senderId });
		//console.log("Lead:", lead)

		// Update existing lead
		lead.flows[lead.flows.length - 1].messages += `MegaBot: se envió el Flow ${flowName} nuevamente al cliente.`;
		console.log("Ultimo flow:", lead.flows[lead.flows.length - 1], )
		await lead.save();

	} catch (error) {
		console.error(
			`Error en reSendFlowToCustomer.js:`,
			error.response?.data || error.message
		);
		console.log("error.message:", error.message);
		//console.log("error:", error);
		
		// Handle the Error
		// Looks existent lead or creates a new one
		let lead = await Leads.findOne({ id_user: senderId });

		// Update existing lead
		lead.flows[lead.flows.length - 1].messages += `MegaBot: NO se pudo enviar el Flow ${flowName} nuevamente al cliente. Error: ${error.message}`;
		await lead.save();

		// Notify Error to the Admin 
		const message = `*NOTIFICACION DE ERROR:* Hubo un error al reenviar el Flow al cliente.`
		await adminWhatsAppNotification(message)
		
	}
};
