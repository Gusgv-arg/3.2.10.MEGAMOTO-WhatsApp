import axios from "axios";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

// Función que verifica validez de WhatsApp enviando un Template
export const verifyWhatsAppNumber = async (customerPhone,
	customerName,
	vendorPhone,
	vendorName) => {
    try {

        // Posts the message to Whatsapp
        const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
        const data = {
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
                return false // Si no se puede enviar el mensaje, retornar false
            });
            return true // Si se envía correctamente el mensaje, retornar true
    
        } catch (error) {
        console.log("Error en verifyWhatsAppNumber.js:", error.response ? error.response.data : error.message);
        
        throw error.response ? error.response.data : error.message;
    }
};
