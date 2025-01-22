export const extractFlowToken_2Responses = (userMessage) => {
	let extraction =
		"*Notificación Automática:*\nTus respuestas fueron registradas.\n\n";

	// Validar que userMessage existe
	if (!userMessage) {
		console.error("Invalid userMessage:", userMessage);
		return { extraction: "", flowToken: "" };
	}

	// Asegurarnos de trabajar con el objeto JSON correctamente
	let decodedMessage;
	try {
		// Intentar parsear si es string
		decodedMessage =
			typeof userMessage === "string" ? JSON.parse(userMessage) : userMessage;
	} catch (error) {
		console.error("Error parsing message:", error);
		return { extraction: "", flowToken: "" };
	}

	// Extraer la respuesta del vendedor
	if ("Atención del Lead" in decodedMessage) {
		extraction += `Atención Lead: ${decodedMessage["Atención del Lead"]}\n`;

		// Si es "Atender más tarde" pero no especificó días, establecer 1 día por defecto
		if (
			decodedMessage["Atención del Lead"] === "Atender más tarde" &&
			!("A contactar en días" in decodedMessage)
		) {
			extraction += `Contactar en: 1 día (por defecto al no responder)\n`;
		}
	}

	// Contactar en días
	if ("A contactar en días" in decodedMessage) {
		extraction += `Contactar en: ${decodedMessage["A contactar en días"]} días\n`;
	}

	// Derivación del vendedor
	if ("Derivar Lead" in decodedMessage) {
		extraction += `Derivación a otro Vendedor: ${decodedMessage["Derivar Lead"]}\n`;
	}

	// Extraer notas del vendedor
	if ("Notas" in decodedMessage) {
		extraction += `Notas: ${decodedMessage["Notas"]}\n`;
	}

	extraction += `\n*¡Mucha suerte con tu venta!*`;

	// Extraer flow token
	const flowToken = decodedMessage.flow_token;

	return { extraction, flowToken };
};
/* extractFlowToken_2Responses2({
  name: 'gustavo gomez villafane',
  userPhone: '5491161405589',
  channel: 'whatsapp',
  message: '{"Atenci\\u00f3n del Lead":"Atender ahora","flow_token":"2ca170e3b-9734-48e8-9fcf-5d6793516a4d"}',
  type: 'interactive',
  audioId: '',
  imageId: '',
  documentId: ''
}); */
