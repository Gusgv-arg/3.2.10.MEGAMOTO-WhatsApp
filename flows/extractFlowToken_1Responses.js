export const extractFlowToken_1Responses = (userMessage) => {
	let extraction = "";
	let model = true;
	let DNI = true;

	// Definir las marcas a buscar
	const marcas = ["Benelli", "Suzuki", "Sym", "Motomel", "Keeway", "Tarpan", "Teknial motos eléctricas", "TVS", "No sé"];
	let marcasEncontradas = [];
	let modelosEncontrados = [];

	// Buscar la marca y el modelo en el string
	marcas.forEach((m) => {
		const regex = new RegExp(`"${m}":"([^"]+)"`, "g");
		let match;
		while ((match = regex.exec(userMessage)) !== null) {
			marcasEncontradas.push(m);
			modelosEncontrados.push(match[1]); 
		}
	});

	// Crear la notificación con la información extraída
	if (marcasEncontradas.length > 0) {
		extraction =
			extraction +
			marcasEncontradas
				.map(
					(marca, index) =>
						`Marca: ${marca}\nModelo: ${modelosEncontrados[index]}\n`
				)
				.join("");
	} else {
	// Caso que el cliente no informa marca y modelo. Se lo notifica y se le vuelve a enviar el flow 
		model = false;
	}

	// Extraer el método de pago
	const metodoPagoRegex = /"Seleccionar lo que corresponda":\s*(\[[^\]]*\])/;
	const metodoPagoMatch = userMessage.match(metodoPagoRegex);
	let metodoPagoArray = [];

	if (metodoPagoMatch && metodoPagoMatch[1]) {
		metodoPagoArray = JSON.parse(metodoPagoMatch[1]);
		extraction += `Método de pago: ${metodoPagoArray.join(", ")}\n`;
	}

	// Extraer el DNI
	const dniRegex = /"DNI":"([^"]+)"/;
	const dniMatch = userMessage.match(dniRegex);
	if (dniMatch && dniMatch[1]) {
		extraction += `DNI: ${dniMatch[1]}\n`;
	} 
	
	// Verificar si hay un préstamo y el DNI está vacío para volver a enviar el Flow
	if (metodoPagoArray.includes("Préstamo Personal") || metodoPagoArray.includes("Préstamo Prendario")) {
		if (!dniMatch || !dniMatch[1]) {
			DNI = false
		}
	}

	// Extraer las preguntas o comentarios
	const preguntasRegex = /"Preguntas":"([^"]+)"/;
	const preguntasMatch = userMessage.match(preguntasRegex);
	if (preguntasMatch && preguntasMatch[1]) {
		extraction += `Preguntas o comentarios: ${preguntasMatch[1]}`;
	}	
	
	console.log("Generado en extractFlowToken_1Responses.js",extraction);
	
	// Send different messages depending customer responses
	if (model === false && DNI === false){
		extraction = "IMPORTANTE: Por favor informanos tu modelo de interes y tu DNI si vas a sacar un préstamo. Para esto te volvemos a enviar el Formulario. ¡Esto nos permitirá atenderte mejor y más rápido 🙂!\n\nPD: Si estas en tu PC y no ves el formulario entrá en tu celular.";
		return extraction
		
	} else if (model === false){
		extraction = "IMPORTANTE: Por favor informanos tu modelo de interes. Para esto te volvemos a enviar el Formulario. ¡Esto nos permitirá atenderte mejor y más rápido 🙂!\n\nPD: Si estas en tu PC y no ves el formulario entrá en tu celular.";
		return extraction
		
	} else if (DNI === false){
		extraction = "IMPORTANTE: Por favor si vas a solicitar un préstamo indicanos tu DNI. Para esto te volvemos a enviar el Formulario. ¡Esto nos permitirá atenderte mejor y más rápido 🙂!\n\nPD: Si estas en tu PC y no ves el formulario entrá en tu celular.";
		return extraction
		
	} else {
		extraction = extraction + `\n\n¡Gracias por confiar en Megamoto! 🏍️`;
		return extraction;
	}
};
