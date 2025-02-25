export const handleApiError = (error, userMessage = null) => {
	const errorDetails = error?.response?.data
		? JSON.stringify(error.response.data)
		: error.message;

	let logMessage;

	if (error.includes("Error llamando a la API de Credicuotas")) {
		logMessage = error;
	} else {
		logMessage = `Error en processWhatsAppFlowWithApi.js: ${errorDetails}`;
	}

	return logMessage;
};
