import dotenv from "dotenv";
import axios from "axios";
import { saveMessageInDb } from "../utils/saveMessageInDb.js";

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const myPhone = process.env.MY_PHONE

export const postWhatsAppCampaign = async (req, res) => {
	try {
		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			to: myPhone,
			type: "template",
			template: {
				name: "lanzamiento_gustech",
				language: {
					code: "es_AR",
				},
				components: [
					{
						type: "body",
						parameters: [
							{
								type: "text",
								text: "Gustavo", // Reemplaza con la variable requerida
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

		res.status(200).send("EVENT_RECEIVED");
	} catch (error) {
		console.log("Error in postWhatsappCampaign.js:", error.message);
		throw error;
	}
};
