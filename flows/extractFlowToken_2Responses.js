export const extractFlowToken_2Responses = (flowMessage) => {
	let extraction =
		"*🔔 Notificación Automática:*\n✅ Tus respuestas fueron registradas.\n\n";

	// Validar que userMessage existe
	if (!flowMessage) {
		console.error("Invalid userMessage:", flowMessage);
		return { extraction: "", flowToken: "" };
	}

	// Asegurarnos de trabajar con el objeto JSON correctamente
	let decodedMessage;
	let days;
	let delegate;
	let notes;
	try {
		// Intentar parsear si es string
		decodedMessage =
			typeof flowMessage === "string" ? JSON.parse(flowMessage) : flowMessage;
		console.log(`decodedMessage: ${JSON.stringify(decodedMessage, null, 2)}`);
	} catch (error) {
		console.error("Error parsing message:", error);
		return { extraction: "", flowToken: "" };
	}

	// Extraer la respuesta del vendedor
	if ("Atención del Lead" in decodedMessage) {
		extraction += `Atención Lead: ${decodedMessage["Atención del Lead"]}\n`;

		if (
			decodedMessage["Atención del Lead"] === "Atender más tarde" &&
			!("A contactar en días" in decodedMessage)
		) {
			// Si es "Atender más tarde" pero no especificó días, establecer 1 día por defecto
			days = 1;
			extraction += `Contactar en: ${days} día (por defecto al no responder)\n`;
		
		} else if (
			decodedMessage["Atención del Lead"] === "Atender más tarde" &&
			"A contactar en días" in decodedMessage
		) {
			extraction += `Contactar en: ${decodedMessage["A contactar en días"]} días\n`;
			days = decodedMessage["A contactar en días"];
					
		} else if (
			decodedMessage["Atención del Lead"] === "Derivar a Gustavo Glunz" ||
			decodedMessage["Atención del Lead"] === "Derivar a Gustavo G.Villafañe" ||
			decodedMessage["Atención del Lead"] === "Joana"
		) {
			extraction += `Derivación a otro Vendedor: ${decodedMessage["Derivar Lead"]}\n`;
			delegate = decodedMessage["Derivar Lead"];
		}
	}	

	// Extraer notas del vendedor
	if ("Notas" in decodedMessage) {
		extraction += `Notas: ${decodedMessage["Notas"]}\n`;
		notes = decodedMessage["Notas"];
	}

	extraction += `\n*¡Mucha suerte con tu venta!*`;

	// Extraer flow token
	const flowToken = decodedMessage.flow_token;

	console.log(
		`Log desde extractFlowToken_2Responses.js:\nextraction: ${extraction}\nflowToken: ${flowToken}\ndays: ${days}\ndelegate: ${delegate}\nnotes: ${notes}`
	);

	return { extraction, flowToken, days, delegate, notes };
};
/* extractFlowToken_2Responses('{"Atenci\\u00f3n del Lead":"Atender m\\u00e1s tarde","Notas":"Notas mias. No puse dias","flow_token":"2a06e7722-394e-48b8-ad2b-c5e22c19cd44"}');
 */
