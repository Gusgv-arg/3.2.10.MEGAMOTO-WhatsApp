import { handleWhatsappMessage } from "../utils/whatsapp/handleWhatsappMessage.js";
import { sendMenuToAdmin } from "../utils/templates/sendMenuToAdmin.js";
import { changeMegaBotSwitch } from "../functions/changeMegaBotSwitch.js";

const adminPhone = process.env.MY_PHONE;
const admin2Phone = process.env.MY_PHONE2;

export const adminFlowMenuMiddleware = async (req, res, next) => {
	const body = req.body;
	let isScrapperCalled = false;

	const userPhone = body.entry[0].changes[0]?.value?.messages?.[0]?.from
		? body.entry[0].changes[0].value.messages[0].from
		: "";

	let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages?.[0]
		?.type
		? body.entry[0].changes[0].value.messages[0].type
		: body.entry[0].changes[0];

	if (userPhone === adminPhone || userPhone === admin2Phone) {
		if (typeOfWhatsappMessage !== "interactive") {
			// Si detecta al Admin y No es un Flow envía el Flow con el Menú
			const notification = `*🔔 Notificación MEGAMOTO:*\n\n⚠️ Entrá a tu celular para ver el Menú de Opciones del Administrador.\n\n*Megamoto*`;

			await handleWhatsappMessage(userPhone, notification);

			await sendMenuToAdmin(userPhone);

			return res.status(200).send("EVENT_RECEIVED");

		} else if (typeOfWhatsappMessage === "interactive") {
			res.status(200).send("EVENT_RECEIVED");

			const message =
				body.entry[0].changes[0].value.messages[0].interactive.nfm_reply
					.response_json;

			console.log("entró acá:", message);
            
			// ----- DISTINTAS FUNCIONES DEL ADMIN ------------------------------------------
			if (message.screen_0_Opciones_0 === "0_1-Prender_API_WhatsApp") {
				//Change general switch to ON
				await changeMegaBotSwitch("ON");

				const notification = `*🔔 Notificación MEGAMOTO:*\n\n⚠️ La API de WhatsApp fue prendida.\n\n*Megamoto*`;

				// WhatsApp Admin notification
				await handleWhatsappMessage(userPhone, notification);

				console.log(`${userPhone} prendió la API.`);
			}
		}
	} else {
		// No es el Admin y no es un Flow del Admin hace next
		next();
	}
};
