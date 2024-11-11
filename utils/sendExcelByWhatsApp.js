import axios from "axios";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const sendExcelByWhatsApp = async (userPhone, fileUrl) => {
	try {
		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: userPhone,
			type: "document",
			document: {
				link: fileUrl,
				filename: "Productos de Mercado Libre.xlsx",
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
					"Error enviando a Facebook------------>",
					error.response ? error.response.data : error.message
				);
			});
		
        if (response.data) {
			console.log("Excel enviado por whatsApp al Admin!");
		}
	} catch (error) {
		console.log("Error in sendExcelByWhatsApp.js:", error.message);
	}
};
