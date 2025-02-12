import Prices from "../models/prices.js";

export const extractFlowToken_1Responses = async (flowMessage) => {
	// Paso del formato json a string
	//flowMessage = JSON.stringify(flowMessage) // descomentar en localhost
	
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

	let model = true;
	let DNI = true;

	//console.log("Lo que viene del Flow1:", flowMessage);

	// Definir las marcas a buscar
	const marcas = [
		"Benelli",
		"Suzuki",
		"SYM",
		"Motomel",
		"Keeway",
		"Tarpan",
		"Teknial eléctricas",
		"Teknial",
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
	//console.log("marcas",marcasEncontradas)
	//console.log("modelos",modelosEncontrados)

	// Función que busca los precios del modelo buscado x el lead
	const buscarPrecios = async (modelo) => {
		// Intentar encontrar el precio por el modelo principal
		let precioData = await Prices.findOne({ 
			$expr: { 
				$eq: [{ $toLower: "$modelo" }, modelo.toLowerCase()] 
			} 
		});
		
		// Si no se encuentra, buscar en el campo de sinónimos
		if (!precioData) {
			precioData = await Prices.findOne({ 
				sinónimos: { 
					$elemMatch: { 
						$eq: modelo.toLowerCase() 
					} 
				} 
			});
		}
		
		return precioData ? precioData.precio : "No disponible";
	};

	// Crear la notificación con la información extraída
	if (marcasEncontradas.length > 0) {

		// Toma el 1 registro y guarda marca, modelo y precio
		response.brand = marcasEncontradas[0];
		response.model = modelosEncontrados[0];
		const precio = await buscarPrecios(modelosEncontrados[0]); // Obtener el precio
		response.price = precio; // Guardar el primer precio
		
		// Formatear el precio del primer registro
		const precioFormateado =
		typeof precio === "number"
		? precio.toLocaleString("es-AR", {
			style: "decimal",
			minimumFractionDigits: 0,
		})
		: precio; // Formatear el precio
		
		// Guardar el primer registro en response.message
		response.message = `Marca: ${response.brand}\nModelo: ${response.model}\nPrecio: $ ${precioFormateado}\n`;
		//console.log("response despues de precio", response)
		
		// Guardar los otros productos
		let otrosProductos = [];
		for (let i = 1; i < modelosEncontrados.length; i++) {
			const precioOtro = await buscarPrecios(modelosEncontrados[i]); // Obtener el precio
			const precioFormateado =
			typeof precioOtro === "number"
			? precioOtro.toLocaleString("es-AR", {
				style: "decimal",
				minimumFractionDigits: 0,
			})
			: precioOtro; // Formatear el precio
			//const precioFormateado=1111
			
			response.message += `Marca: ${marcasEncontradas[i]}\nModelo: ${modelosEncontrados[i]}\nPrecio: $ ${precioFormateado}\n`
			
			otrosProductos.push(
				`Marca: ${marcasEncontradas[i]}\nModelo: ${modelosEncontrados[i]}\nPrecio: $ ${precioFormateado}\n`
			);
		}
		response.otherProducts = otrosProductos.join(""); // Unir otros productos en un solo string
		//console.log("response despues de otros pro", response)
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
		response.message += `Método de pago: ${metodoPagoArray.join(", ")}\n`;
		response.payment = metodoPagoArray.join(", ");
		//console.log("response despues de metodo de pago", response)
	}
	
	// Extraer el DNI
	const dniRegex = /"DNI":"([^"]+)"/;
	const dniMatch = flowMessage.match(dniRegex);
	if (dniMatch && dniMatch[1]) {
		response.message += `DNI: ${dniMatch[1]}\n`;
		response.dni = dniMatch[1];
		//console.log("response despues de dni", response)
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
		response.message += `Preguntas: ${preguntasMatch[1].replace(
			/\\u00e9/g,
			"é"
		)}`;
		response.questions = preguntasMatch[1].replace(/\\u00e9/g, "é");
		//console.log("response despues de preguntas", response)
	} else {
		//console.log("No se encontraron preguntas en el mensaje.");
	}

	// Send different messages depending customer responses
	if (model === false && DNI === false) {
		response.message =
			"\n*❗ IMPORTANTE:* 🙏 Por favor informanos tu *modelo de interes y tu DNI* si vas a sacar un préstamo. Para atenderte mejor te volvemos a enviar el Formulario. 🙂\n\n*PD: Entrá en tu celular para ver el segundo mensaje.*";
		 
		return response;
	
	} else if (model === false) {
		response.message =
			"\n*❗ IMPORTANTE:* 🙏 Por favor informanos tu *modelo de interes*. Para atenderte mejor te volvemos a enviar el Formulario. 🙂\n\n*PD: Entrá en tu celular para ver el segundo mensaje.*";
		
		return response;
	
	} else if (DNI === false) {
		response.message =
			"\n*❗ IMPORTANTE:* 🙏 Por favor si vas a solicitar un préstamo indicanos tu *DNI*. Para atenderte mejor te volvemos a enviar el Formulario. 🙂\n\n*PD: Entrá en tu celular para ver el segundo mensaje.*";

		return response;
	
	} else {
		response.message +=	`\n❗ Los precios informados no incluyen patentamiento ni sellados; están sujeto a modificaciones y deberán ser reconfirmados por el vendedor.\n\n*¡Gracias por confiar en MEGAMOTO!* 🏍️`;
		
		//console.log("Response desde extractFlowToken_1Responses.js", response)
		
		return response;
	}
};
/* extractFlowToken_1Responses('{"Seleccionar lo que corresponda":["Efectivo, Transferencia o Tarjeta de D\\u00e9bito"],"Motomel":"MAX 110 A\\/E","Benelli":"Leoncino 500 (todas AM2022)","Keeway":"KEEWAY K-Light 202","Teknial":"TK-REVOLT","flow_token":"1"}') */