import { extractFlowToken_1Responses } from "./extractFlowToken_1Responses.js";
import { extractFlowToken_2Responses } from "./extractFlowToken_2Responses.js";

export const extractFlowResponses = (userMessage) => {
	let finalNotification = "";
	const flowMessage = userMessage.message

	if (flowMessage.includes('"flow_token":"1"')) {
		// FLOW_TOKEN = 1 
		const extraction = extractFlowToken_1Responses(flowMessage);
		
		// Verificar si extraction comienza con "¡IMPORTANTE!"
		if (extraction.includes("IMPORTANTE:")) {
			const flowToken = 1;
			finalNotification = `*¡Hola ${userMessage.name} 👋!*\n${extraction}`;
			console.log("FinalNotification:", finalNotification)
			return {finalNotification, flowToken};
		} else {
			const greet = `*¡Hola ${userMessage.name} 👋!* En breve te va a contactar un vendedor por tu consulta:\n\n`;
			finalNotification = greet + extraction;
			console.log("FinalNotification:", finalNotification)
			const flowToken = 1;
			return { finalNotification, flowToken };
		}
	} else if (userMessage.message.includes('"flow_token":"2')) {
		// FLOW_TOKEN = 2
		const responses = extractFlowToken_2Responses(userMessage.message);
		const { extraction, flowToken } = responses;
		finalNotification = extraction;
		
		return { finalNotification, flowToken };
	} else {
		console.log("No se encontró el Flow Token");
		return;
	}
};

/* extractFlowResponses({
  name: 'gustavo gomez villafane',
  userPhone: '5491161405589',
  channel: 'whatsapp',
  message: '{"Preguntas":"Hola","Seleccionar lo que corresponda":{"1":"Efectivo, Transferencia o Tarjeta de Débito"},"Motomel":"BLITZ 110 V8 START","flow_token":"1"}',
  type: 'interactive',
  audioId: '',
  imageId: '',
  documentId: ''
}); */ 
