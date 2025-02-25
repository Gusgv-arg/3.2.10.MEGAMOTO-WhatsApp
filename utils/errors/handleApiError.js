

export const handleApiError = (error, userMessage = null) => {
    const errorDetails = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;

    const logMessage = userMessage
        ? `Error llamando a la API de Credicuotas para el Lead ${userMessage.name}: ${errorDetails}`
        : `Error en processWhatsAppFlowWithApi.js: ${errorDetails}`;

    return logMessage;
}