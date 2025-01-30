import Prices from "../models/prices.js";

export const extractFlowToken_1Responses = async (flowMessage) => {
	let extraction = "";
	let model = true;
	let DNI = true;

	// Definir las marcas a buscar
	const marcas = ["Benelli", "Suzuki", "Sym", "Motomel", "Keeway", "Tarpan", "Teknial eléctricas", "TVS", "No sé"];
	let marcasEncontradas = [];
	let modelosEncontrados = [];

	// Buscar la marca y el modelo en el string
	marcas.forEach((m) => {
		const regex = new RegExp(`"${m}":"([^"]+)"`, "g");
		let match;
		while ((match = regex.exec(flowMessage)) !== null) {
			marcasEncontradas.push(m);
			modelosEncontrados.push(match[1]);
		}
	});
	
	// Función que busca los precios del modelo buscado x el lead
	const buscarPrecios = async (modelo) => {
		const precioData = await Prices.findOne({ modelo }); 
		return precioData ? precioData.precio : "No disponible"; 
	}; 
	
	// Crear la notificación con la información extraída
	if (marcasEncontradas.length > 0) {
		for (const modelo of modelosEncontrados) {
			const precio = await buscarPrecios(modelo); // Obtener el precio
			const precioFormateado = typeof precio === 'number' ? precio.toLocaleString('es-AR', { style: 'decimal', minimumFractionDigits: 0 }) : precio; // Formatear el precio
			//const precioFormateado = 1111 // descomentar cuando hago pruebas en local
		extraction += `Marca: ${marcasEncontradas[modelosEncontrados.indexOf(modelo)]}\nModelo: ${modelo}\nPrecio: $ ${precioFormateado}`;
	}

	} else {
	// Caso que el cliente no informa marca y modelo. Se lo notifica y se le vuelve a enviar el flow 
		model = false;
	}

	// Extraer el método de pago
	const metodoPagoRegex = /"Seleccionar lo que corresponda":\[(.*?)\]/;
	const metodoPagoMatch = flowMessage.match(metodoPagoRegex);
	let metodoPagoArray = [];

	if (metodoPagoMatch) {
		metodoPagoArray = metodoPagoMatch[1]
			.split(',')
			.map(item => item.trim().replace(/"/g, ''))
			.map(item => item.replace(/\\u00e9/g, 'é')); // Decodifica caracteres Unicode si es necesario
		extraction += `Método de pago: ${metodoPagoArray.join(", ")}\n`;
	}

	// Extraer el DNI
	const dniRegex = /"DNI":"([^"]+)"/;
	const dniMatch = flowMessage.match(dniRegex);
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
	const preguntasMatch = flowMessage.match(preguntasRegex);
	if (preguntasMatch && preguntasMatch[1]) {
		extraction += `Preguntas o comentarios: ${preguntasMatch[1]}`;
	}	
		
	// Send different messages depending customer responses
	if (model === false && DNI === false){
		extraction = "\n*❗ IMPORTANTE:* 🙏 Por favor informanos tu *modelo de interes y tu DNI* si vas a sacar un préstamo. Para atenderte mejor te volvemos a enviar el Formulario. 🙂\n\n*PD: Entrá en tu celular para ver el segundo mensaje.*";
		return extraction
		
	} else if (model === false){
		extraction = "\n*❗ IMPORTANTE:* 🙏 Por favor informanos tu *modelo de interes*. Para atenderte mejor te volvemos a enviar el Formulario. 🙂\n\n*PD: Entrá en tu celular para ver el segundo mensaje.*";
		return extraction
		
	} else if (DNI === false){
		extraction = "\n*❗ IMPORTANTE:* 🙏 Por favor si vas a solicitar un préstamo indicanos tu *DNI*. Para atenderte mejor te volvemos a enviar el Formulario. 🙂\n\n*PD: Entrá en tu celular para ver el segundo mensaje.*";
		return extraction
		
	} else {

		extraction = extraction + `\n❗ Los precios informados no incluyen patentamiento ni sellados, están sujeto a modificaciones y deberán ser reconfirmados por el vendedor.\n\n*¡Gracias por confiar en MEGAMOTO!* 🏍️`;
		console.log(extraction)
		return extraction;
	}
};
//extractFlowToken_1Responses('{"Seleccionar lo que corresponda":["Efectivo, Transferencia o Tarjeta de D\\u00e9bito"],"Motomel":"BLITZ 110 V8 START","Suzuki":"AX100","flow_token":"1"}')