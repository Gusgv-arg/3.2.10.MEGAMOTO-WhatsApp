export const extractFlowToken_2Responses = (flowMessage, name) => {
	
	let response = {
		message: "*🔔 Notificación Automática:*\n\n✅ Tus respuestas fueron registradas.\n",
		flowToken: "",
		days: 0,
		delegate: "",
		notes: "",
		status: ""
	};
	
	// Intentar parsear si es string
	const decodedMessage =
			typeof flowMessage === "string" ? JSON.parse(flowMessage) : flowMessage;
		//console.log(`decodedMessage: ${JSON.stringify(decodedMessage, null, 2)}`);
	
	// Extraer la respuesta del vendedor
	if ("Atención del Lead" in decodedMessage) {
		response.message += `Atención Lead ${name}: ${decodedMessage["Atención del Lead"]}\n`;
		response.status = "vendedor"
		
		if (decodedMessage["Atención del Lead"] === "Atender ahora" && ("A contactar en días" in decodedMessage) ){
			// Caso erróneo que dice Atender ahora y pone días
			response.days = 0
		}

		else if (
			decodedMessage["Atención del Lead"] === "Atender más tarde" &&
			!("A contactar en días" in decodedMessage)
		) {
			// Si es "Atender más tarde" pero no especificó días, establecer 1 día por defecto
			response.days = 1;
			response.message += `Contactar en: ${response.days} día (por defecto al no responder)\n`;			
			
		} else if (
			decodedMessage["Atención del Lead"] === "Atender más tarde" &&
			"A contactar en días" in decodedMessage
		) {
			// Atender más tarde y pone días
			response.message += `Contactar en: ${decodedMessage["A contactar en días"]} días\n`;
			response.days = decodedMessage["A contactar en días"];
			response.status = "a contactar";

		} else if (
			decodedMessage["Atención del Lead"] === "Derivar a Gustavo Glunz" ||
			decodedMessage["Atención del Lead"] === "Derivar a Gustavo G.Villafañe" ||
			decodedMessage["Atención del Lead"] === "Joana"
		) {
			// Deriva a otro vendedor
			response.delegate = decodedMessage["Atención del Lead"];
			response.status = "vendedor derivado"
		}
	}

	// Extraer notas del vendedor
	if ("Notas" in decodedMessage) {
		response.message += `Notas: ${decodedMessage["Notas"]}\n`;
		response.notes = decodedMessage["Notas"];
	}

	response.message += `\n*¡Mucha suerte con tu venta!*`;

	// Extraer flow token
	response.flowToken = decodedMessage.flow_token;

	//console.log("response:", response); 

	return response;
};
/* extractFlowToken_2Responses('{"Atenci\\u00f3n del Lead":"Derivar a Gustavo Glunz","Notas":"Deriva a gg","flow_token":"2b772b929-c67d-4a6a-9d52-b9db009404c9"}'); */

