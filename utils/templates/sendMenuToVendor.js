import axios from "axios";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

// Función que envía el menú al Admin por WhatsApp
export const sendMenuToVendor = async (userPhone) => {
    // URL where to post
    const url = `https://graph.facebook.com/v21.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

    // Payload for sending a template with an integrated flow
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: userPhone,
        type: "template",
        template: {
            name: process.env.FLOW_VENDOR,
            language: { code: "es" },
            components: [
                {
                    type: "BUTTON",
                    sub_type: "flow",
                    index: "0",
                    parameters: [{ type: "action", action: { flow_token: 0 } }],
                },
            ]
        },
    };

    try {
        // Post to the customer
        const response = await axios.post(url, payload, {
            headers: { "Content-Type": "application/json" },
        });

        if (response.data) {
            console.log(`Se envió el Menú al Vendedor: ${userPhone}`);
        }		
    } catch (error) {
        console.error(
            `Error en sendMenuToAdmin.js:`,
            error?.response?.data
                ? JSON.stringify(error.response.data)
                : error.message
        );
        const errorMessage = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message

        // Notify Error to the Admin
        const message = `🔔 *NOTIFICACION DE ERROR:*\nHubo un error al enviar el Menú de Vendedor.\nError: ${errorMessage}\n\nMegamoto`;

        await adminWhatsAppNotification(userPhone, message);
    }
};
