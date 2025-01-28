import Leads from "../../models/leads.js";

export const saveNotificationInDb = async (userMessage, notification) => {
	// Save the sent message to the database
	try {
		// Find the lead
		let lead = await Leads.findOne({ id_user: userMessage.userPhone });

		// If the lead does not exist for that thread, there is an error and returns.
		if (lead === null) {
			console.log("¡¡ERROR: Lead not found in DB!!");
			return;
		} else {
			// Obtain current date and hour
			const currentDateTime = new Date().toLocaleString("es-AR", {
				timeZone: "America/Argentina/Buenos_Aires",
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});

			// Actualizar mensajes
			let lastFlow = lead.flows[lead.flows.length - 1];
			lastFlow.messages += `\n${currentDateTime} ${userMessage.name}: ${userMessage.message}\n${currentDateTime} - API: ${notification}`;

			// Actualizar estado y history del lead
			if (notification.includes("IMPORTANTE")) {
				// Casos de faltantes de informacion en el FLOW 1

				if (notification.includes("modelo de interes y tu DNI")) {
					// Si falta el modelo y el DNI
					lastFlow.client_status = "faltan modelo y DNI";
					lastFlow.history += `${currentDateTime} - Status: faltan modelo y DNI. `;
				} else if (notification.includes("préstamo")) {
					// Si falta el DNI
					lastFlow.client_status = "falta DNI";
					lastFlow.history += `${currentDateTime} - Status: falta DNI. `;
				} else if (notification.includes("modelo")) {
					// Si falta modelo
					lastFlow.client_status = "falta modelo";
					lastFlow.history += `${currentDateTime} - Status: falta modelo. `;
				}
			} else if (notification.includes("¡Gracias por confiar en MEGAMOTO!")) {
				// Envío completo del FLOW 1

				// Extraer y guardar marca, modelo, precio y otros productos (en un string)
				const brandModelPriceMatches = notification.match(/Marca: ([^\n]+)\s*Modelo: ([^\n]+)\s*Precio: \$\s*([0-9.,]+)/g);
				if (brandModelPriceMatches) {
					// Guardar los primeros tres productos
					const firstProduct = brandModelPriceMatches[0].match(/Marca: ([^\n]+)\s*Modelo: ([^\n]+)\s*Precio: \$\s*([0-9.,]+)/);
					if (firstProduct) {
						lastFlow.brand = firstProduct[1].trim();
						lastFlow.model = firstProduct[2].trim();
						lastFlow.price = firstProduct[3].trim();
					}

					// Guardar otros productos
					if (brandModelPriceMatches.length > 1) {
						const otherProducts = brandModelPriceMatches.slice(1).join(', ').replace(/\n/g, ' ');
						lastFlow.otherProducts = otherProducts; // Guardar productos adicionales
					}
				}

				// Extraer informacion de otros campos
				const paymentMatch = notification.match(
					/Método de pago: (.*?)(?=\s*DNI:)/
				);
				const dniMatch = notification.match(/DNI: (\d+)/);
				const questionsMatch = notification.match(
					/Preguntas o comentarios: ([^\n]+)/
				);

				// Actualiza otros campos
				if (paymentMatch) lastFlow.payment = paymentMatch[1].trim();
				if (dniMatch) lastFlow.dni = parseInt(dniMatch[1]);
				if (questionsMatch) lastFlow.questions = questionsMatch[1].trim();

				// Cambio del status del lead
				lastFlow.client_status = "esperando";
				lastFlow.history += `${currentDateTime} - Status: esperando. `;
			} else if (userMessage.wamId_Flow1) {
				// Grabo el wamId
				lastFlow.wamId_flow1 = userMessage.wamId_Flow1;
			}

			// Update lead
			await lead.save();
			return;
		}
	} catch (error) {
		console.log("error en saveNotificationInDb.js:", error.message);
		throw new Error(error.message);
	}
};
