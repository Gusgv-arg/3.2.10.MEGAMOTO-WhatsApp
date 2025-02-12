import axios from "axios";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import Leads from "../../models/leads.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const adminPhone = process.env.MY_PHONE

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

export const sendVendorDataToLead = async (
	customerPhone,
	customerName,
	vendorPhone,
	vendorName
) => {
	// URL where to post
	const url = `https://graph.facebook.com/v21.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

	// Payload for sending a template with an integrated flow
	const payload = {
		messaging_product: "whatsapp",
		recipient_type: "individual",
		to: customerPhone,
		type: "template",
		template: {
			name: process.env.TEMPLATE_DATOS_VENDEDOR_PARA_LEAD,
			language: { code: "es" },
			components: [
				{
					type: "body",
					parameters: [
						{
							type: "text",
							text: customerName,
						},
						{
							type: "text",
							text: vendorName,
						},
						{
							type: "text",
							text: vendorPhone,
						},
					],
				},
			],
		},
	};

	try {
		// Post to the customer
		const response = await axios.post(url, payload, {
			headers: { "Content-Type": "application/json" },
		});

		//console.log("Id del whatsApp enviado:", response.data.messages[0].id)
	} catch (error) {
		console.error(
			`Error en sendVendorDataToLead.js:`,
			error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message
		);
		const errorMessage = error?.response?.data
		? JSON.stringify(error.response.data)
		: error.message

		// Handle the Error
		// Looks existent lead
		let lead = await Leads.findOne({ id_user: userMessage.userPhone });

		// Update existing lead
		lead.flows[
			lead.flows.length - 1
		].error += `${currentDateTime} NO se pudo notificar al Lead los datos del vendedor. Error: ${error.message}`;

		await lead.save();

		// Notify Error to the Admin
		const message = `🔔 *NOTIFICACION DE ERROR:* Hubo un error al enviar los datos del vendedor al Lead ${userMessage.name}.\nError: ${errorMessage}`;

		await adminWhatsAppNotification(adminPhone, message);
	}
};
