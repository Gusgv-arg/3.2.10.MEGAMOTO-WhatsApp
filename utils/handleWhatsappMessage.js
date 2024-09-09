import dotenv from "dotenv";
import axios from "axios";
import { saveMessageInDb } from "./saveMessageInDb.js";

dotenv.config();

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
				//body: "Hola desde https://www.gus-tech.com",
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
		console.log("Error en handleWhatsappMessage", error.message);
		throw error;
	}
};
