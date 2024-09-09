import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const myPhone = process.env.MY_PHONE

export const newErrorWhatsAppNotification = async (channel, error) => {
	try {
		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			to: myPhone,
			type: "template",
			template: {
				name: "notificacion_error",
				language: {
					code: "es_AR",
				},
				components: [
					{
						type: "body",
						parameters: [
							{
								type: "text",
								text: channel, // Reemplaza con la variable requerida
							},
							{
								type: "text",
								text: error, // Reemplaza con la variable requerida
							},
						],
					},
				],
			},
		};

		const response = await axios
			.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			.then((response) => {
				console.log("Response from Facebook:", response.data);
			})
			.catch((error) => {
				console.error(
					"Error enviando a Facebook------------>",
					error.response ? error.response.data : error.message
				);
			});

		
	} catch (error) {
		console.log("Error in newErrorWhatsAppNotification.js:", error.message);
		throw error;
	}
};
