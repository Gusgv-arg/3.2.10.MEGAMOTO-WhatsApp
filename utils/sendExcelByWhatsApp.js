import axios from "axios";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const sendExcelByWhatsApp = async (userPhone, filePath) => {
	try {
		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: userPhone,
			type: "document",
			document: {
				preview_url: true,
				url: filePath,
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

            console.log("Excel enviado por whatsApp al Admin!")
	} catch (error) {
		console.log("Error in sendExcelByWhatsApp.js:", error.message);
		throw error;
	}
};
