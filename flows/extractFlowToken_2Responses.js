export const extractFlowToken_2Responses = (userMessage) => {
	let extraction = "";

	// Extraer la respuesta del vendedor
	if (userMessage.message.includes("Tomar Lead")){
		const regex = /"Tomar Lead":"([^"]+)"/;
		const atención = userMessage.message.match(regex);
		extraction += `Respuesta del Vendedor: ${atención[1]}\n`;
	}
	
	// Derivación del vendedor
	if (userMessage.message.includes("Derivar Lead")){
		const regex0 = /"Derivar Lead":"([^"]+)"/;
		const derivar = userMessage.message.match(regex0);
		extraction += `Derivación a Vendedor: ${derivar[1]}\n`;
	}

	// Extraer notas del vendedor.
	if (userMessage.message.includes("Notas")){
		const regex1 = /"Notas sobre el lead":"([^"]+)"/;
		const notas = userMessage.message.match(regex1);
		extraction += `Notas del Vendedor: ${notas[1]}\n`;
	}

	// Extraer token
	const regex2 = /"flow_token":"([^"]+)"/;
	const flowToken = userMessage.message.match(regex2)[1];
	console.log(extraction)
	return { extraction, flowToken };
};

//extractFlowToken_2Responses('{"Tomar Lead":"Atender más tarde","flow_token":"2e57cdb81-8fd6-4e4d-a1cc-4bd89c673a38"}'); 