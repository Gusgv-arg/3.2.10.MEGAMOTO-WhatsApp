import Prices from "../models/prices.js";

export const extractFlowToken_1Responses = async (flowMessage) => {
	// Paso del formato json a string
	flowMessage = JSON.stringify(flowMessage)
	
	// Función que retorna este objeto
	let response = {
		message: "",
		brand: "",
		model: "",
		price: 0,
		otherProducts: "",
		payment: "",
		dni: "",
		questions: "",
	};

	let extraction = "";
	let model = true;
	let DNI = true;

	//console.log("Lo que viene del Flow:", flowMessage);

	// Definir las marcas a buscar
	const marcas = [
		"Benelli",
		"Suzuki",
		"Sym",
		"Motomel",
		"Keeway",
		"Tarpan",
		"Teknial eléctricas",
		"TVS",
		"No sé",
	];
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

		// Toma el 1 registro y guarda marca, modelo y precio
		response.brand = marcasEncontradas[0];
		response.model = modelosEncontrados[0];
		//const precio = await buscarPrecios(modelosEncontrados[0]); // Obtener el precio
		//response.price = precio; // Guardar el primer precio
		response.price = 111; // Guardar el primer precio

		// Guardar los otros productos
		let otrosProductos = [];
		for (let i = 1; i < modelosEncontrados.length; i++) {
			//const precioOtro = await buscarPrecios(modelosEncontrados[i]); // Obtener el precio
			/* const precioFormateado =
				typeof precioOtro === "number"
					? precioOtro.toLocaleString("es-AR", {
							style: "decimal",
							minimumFractionDigits: 0,
					  })
					: precioOtro; */ // Formatear el precio
			const precioFormateado=1111
					otrosProductos.push(
				`Marca: ${marcasEncontradas[i]}\nModelo: ${modelosEncontrados[i]}\nPrecio: $ ${precioFormateado}\n`
			);
		}
		response.otherProducts = otrosProductos.join(""); // Unir otros productos en un solo string
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
			.split(",")
			.map((item) => item.trim().replace(/"/g, ""))
			.map((item) => item.replace(/\\u00e9/g, "é")); // Decodifica caracteres Unicode si es necesario
		extraction += `Método de pago: ${metodoPagoArray.join(", ")}\n`;
		response.payment = metodoPagoArray.join(", ");
	}

	// Extraer el DNI
	const dniRegex = /"DNI":"([^"]+)"/;
	const dniMatch = flowMessage.match(dniRegex);
	if (dniMatch && dniMatch[1]) {
		extraction += `DNI: ${dniMatch[1]}\n`;
		response.dni = dniMatch[1];
	}

	// Verificar si hay un préstamo y el DNI está vacío para volver a enviar el Flow
	if (
		metodoPagoArray.includes("Préstamo Personal") ||
		metodoPagoArray.includes("Préstamo Prendario")
	) {
		if (!dniMatch || !dniMatch[1]) {
			DNI = false;
		}
	}

	// Extraer las preguntas o comentarios
	const preguntasRegex = /"Preguntas":"([^"]+)"/;
	const preguntasMatch = flowMessage.match(preguntasRegex);
	if (preguntasMatch && preguntasMatch[1]) {
		extraction += `Preguntas o comentarios: ${preguntasMatch[1].replace(
			/\\u00e9/g,
			"é"
		)}`;

		response.questions = preguntasMatch[1].replace(/\\u00e9/g, "é");
	}

	// Send different messages depending customer responses
	if (model === false && DNI === false) {
		extraction =
			"\n*❗ IMPORTANTE:* 🙏 Por favor informanos tu *modelo de interes y tu DNI* si vas a sacar un préstamo. Para atenderte mejor te volvemos a enviar el Formulario. 🙂\n\n*PD: Entrá en tu celular para ver el segundo mensaje.*";
		response.message = extraction;
		return response;
	} else if (model === false) {
		extraction =
			"\n*❗ IMPORTANTE:* 🙏 Por favor informanos tu *modelo de interes*. Para atenderte mejor te volvemos a enviar el Formulario. 🙂\n\n*PD: Entrá en tu celular para ver el segundo mensaje.*";
		response.message = extraction;
		return response;
	} else if (DNI === false) {
		extraction =
			"\n*❗ IMPORTANTE:* 🙏 Por favor si vas a solicitar un préstamo indicanos tu *DNI*. Para atenderte mejor te volvemos a enviar el Formulario. 🙂\n\n*PD: Entrá en tu celular para ver el segundo mensaje.*";

		response.message = extraction;
		return response;
	} else {
		extraction =
			extraction +
			`\n❗ Los precios informados no incluyen patentamiento ni sellados; están sujeto a modificaciones y deberán ser reconfirmados por el vendedor.\n\n*¡Gracias por confiar en MEGAMOTO!* 🏍️`;
		console.log(extraction);
		response.message = extraction;
		console.log("Response desde extractFlowToken_1Responses.js", response)
		
		return response;
	}
};
/* extractFlowToken_1Responses({"Seleccionar lo que corresponda":["Tarjeta de Cr\u00e9dito"],"Motomel":"BLITZ 110 V8 START","Suzuki":"AX100","flow_token":"1"}) */
