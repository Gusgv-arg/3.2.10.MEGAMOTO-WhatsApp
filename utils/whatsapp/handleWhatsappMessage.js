import axios from "axios";
import { saveMessageInDb } from "../dataBase/saveMessageInDb.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

// Function that sends GPT message to the user and saves in DB
export const handleWhatsappMessage = async (senderId, messageGpt) => {
	try {
		const name = "MegaBot";
		const channel = "whatsapp";

		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: senderId,
			type: "text",
			text: {
				preview_url: true,
				body: messageGpt,
			},
		};

		const response = await axios
			.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			.catch((error) => {
				console.error(
					"Error enviando a Facebook en handleWhatsappMessage.js--->",
					error.response ? error.response.data : error.message
				);
			});
	} catch (error) {
		console.log("Error en handleWhatsappMessage.js", error.message);
		throw error;
	}
};
