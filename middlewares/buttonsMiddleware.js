import axios from "axios";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";
import { handleWhatsappMessage } from "../utils/handleWhatsappMessage.js";
import { buttonActions } from "../utils/buttonActions.js";

const myPhone = process.env.MY_PHONE;

export const buttonsMiddleware = async (req, res, next) => {
	const body = req.body;
	const channel = body.entry[0].changes ? "WhatsApp" : "Other";
	let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages[0]?.type
		? body.entry[0].changes[0].value.messages[0].type
		: "other type";

	if (channel === "WhatsApp" && typeOfWhatsappMessage === "button") {
		const message = body.entry[0].changes[0].value.messages[0].button.text;
		const senderId = body.entry[0].changes[0].value.messages[0].from;
		console.log("sender:", senderId);

		let button; // For identifying button

		if (message === "pasarme con un vendedor") {
			button = "vendedor";
			const predefinedMessage =
				"¡Gracias! En breve un vendedor se va a estar contactando. ¡Que tengas un buen día!";
			const templateName = "lead_pedido_ya";

			try {
				// Answer with a predefined response to the customer
				await handleWhatsappMessage(senderId, predefinedMessage);

				// Save in DB && in GPT thread && notifies vendor.
				await buttonActions(
					senderId,
					message,
					predefinedMessage,
					button,
					templateName
				);

				res.status(200).send("EVENT_RECEIVED");
			} catch (error) {
				console.log("Error in buttonMiddleware.js", error.message);
				await adminWhatsAppNotification(
					myPhone,
					`*NOTIFICACION de Error contactando al Vendedor:*\n${error.message}`
				);
				res.status(200).send("EVENT_RECEIVED");
			}
		} else if (message === "paso DNI de un conocido") {
			button = "dni";
			const predefinedMessage =
				"¡Perfecto! Envianos un DNI de un familiar o conocido que pienses pueda calificar para un crédito así lo verificamos y nos volvemos a comunicar con vos.";
			const templateName = "lead_pedido_ya";

			// Answer with a predefined response to the customer
			await handleWhatsappMessage(senderId, predefinedMessage);

			// Save in DB && in GPT thread && notifies vendor
			await buttonActions(
				senderId,
				message,
				predefinedMessage,
				button,
				templateName
			);

			res.status(200).send("EVENT_RECEIVED");
		} else {
			next();
		}
	} else {
		next();
	}
};
