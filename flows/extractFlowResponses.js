import { extractFlowToken_1Responses } from "./extractFlowToken_1Responses.js";
import { extractFlowToken_2Responses } from "./extractFlowToken_2Responses.js";

export const extractFlowResponses = (userMessage, userName) => {
	let finalNotification = "";

	if (userMessage.includes('"flow_token":"1"')) {
		// FLOW_TOKEN = 1
		const extraction = extractFlowToken_1Responses(userMessage);
		
		// Verificar si extraction comienza con "¡IMPORTANTE!"
		if (extraction.includes("IMPORTANTE:")) {
			const flowToken = 1;
			finalNotification = `*¡Hola ${userName} 👋!*\n${extraction}`;
			return {finalNotification, flowToken};
		} else {
			const greet = `*¡Hola ${userName} 👋!* En breve te va a contactar un vendedor por tu consulta:\n\n`;
			finalNotification = greet + extraction;
			const flowToken = 1;
			return { finalNotification, flowToken };
		}
	} else if (userMessage.includes('"flow_token":"2')) {
		// FLOW_TOKEN = 2
		const responses = extractFlowToken_2Responses(userMessage);
		const { extraction, flowToken } = responses;
		finalNotification = extraction;
		
		return { finalNotification, flowToken };
	} else {
		console.log("No se encontró el Flow Token");
		return;
	}
};

/* extractFlowResponses(
	'{"Atención del Cliente":"Atender","flow_token":"276cd06cf-6e30-49c7-b193-8e0cd575abe7"}',
	"Gustavo"
); */
