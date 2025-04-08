import axios from "axios";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

// Función que verifica validez de WhatsApp
export const verifyWhatsAppNumber = async (senderId, message) => {
    try {

        // Posts the message to Whatsapp
        const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
        const data = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: senderId,
            type: "text",
            text: {
                preview_url: true,
                body: message,
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
                    "Error verificando celular en verifyWhatsAppNumber.js:",
                    error.response ? error.response.data : error.message
                );
                return false
            });
            return true
    } catch (error) {
        console.log("Error en verifyWhatsAppNumber.js:", error.response ? error.response.data : error.message);
        
        throw error.response ? error.response.data : error.message;
    }
};
