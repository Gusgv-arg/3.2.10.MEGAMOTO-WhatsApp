import { extractFlowToken_1Responses } from "./extractFlowToken_1Responses.js";
import { extractFlowToken_2Responses } from "./extractFlowToken_2Responses.js";

export const extractFlowResponses = async (userMessage) => {
	let finalNotification = "";
	const flowMessage = userMessage.message

	if (flowMessage.includes('"flow_token":"1"')) {
		// FLOW_TOKEN = 1 
		const extraction = await extractFlowToken_1Responses(flowMessage);
		
		// Verificar si extraction comienza con "¡IMPORTANTE!"
		if (extraction.includes("IMPORTANTE:")) {
			const flowToken = 1;
			finalNotification = `*¡Hola ${userMessage.name} 👋!*\n${extraction}`;
			console.log("FinalNotification:", finalNotification)
			return {finalNotification, flowToken};
		} else {
			const greet = `*¡Hola ${userMessage.name} 👋, gracias por tu respuesta!* En breve vas a recibir una notificación con los datos del vendedor que te estará contactando:\n\n`;
			
			finalNotification = greet + extraction;
			console.log("FinalNotification:", finalNotification)
			const flowToken = 1;
			return { finalNotification, flowToken };
		}
	} else if (flowMessage.includes('"flow_token":"2')) {
		
		// FLOW_TOKEN = 2
		const responses = extractFlowToken_2Responses(flowMessage);
		const { extraction, flowToken, days, delegate, notes } = responses;
		console.log("Etraction:", extraction)

		finalNotification = extraction;
		
		return { finalNotification, flowToken, days, delegate, notes };
	} else {
		console.log("No se encontró el Flow Token");
		return;
	}
};

/* extractFlowResponses({
  name: 'gustavo gomez villafane',
  userPhone: '5491161405589',
  channel: 'whatsapp',
  message: '{"Atenci\\u00f3n del Lead":"Atender ahora","flow_token":"26"}',
  type: 'interactive',
  audioId: '',
  imageId: '',
  documentId: ''
}); */
