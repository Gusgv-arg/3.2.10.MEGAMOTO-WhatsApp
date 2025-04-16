import { handleWhatsappMessage } from "../utils/whatsapp/handleWhatsappMessage.js";
import { sendMenuToAdmin } from "../utils/templates/sendMenuToAdmin.js";

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

        if (
            (userPhone === adminPhone && typeOfWhatsappMessage !== "interactive") ||
            (userPhone === admin2Phone && typeOfWhatsappMessage !== "interactive")
        ) {
        // Si detecta al Admin y No es un Flow envía el Flow con el Menú
        const notification = `*🔔 Notificación MEGAMOTO:*\n\n⚠️ Entrá a tu celular para ver el Menú de Opciones del Administrador.\n\n*Megamoto*`;

        await handleWhatsappMessage(userPhone, notification);

        await sendMenuToAdmin(userPhone);

        return res.status(200).send("EVENT_RECEIVED");
	
    } else {
        // No es el Admin y no es un Flow del Admin hace next
        next()
    }
};
