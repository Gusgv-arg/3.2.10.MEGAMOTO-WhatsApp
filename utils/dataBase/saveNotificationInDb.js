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
			} else if (notification.includes("¡Gracias por confiar en Megamoto!")) {
				// Envío completo del FLOW 1

				// Extraer informacion de la notificacion
				const brandMatch = notification.match(/Marca: ([^\n]+)/);
				const modelMatch = notification.match(/Modelo: ([^\n]+)/);
				const paymentMatch = notification.match(
					/Método de pago: (.*?)(?=\s*DNI:)/
				);
				const dniMatch = notification.match(/DNI: (\d+)/);
				const priceMatch = notification.match(/Precio: \$\s*([0-9.,]+)/);
				const questionsMatch = notification.match(/Preguntas o comentarios: ([^\n]+)/);

				// Actualiza marca, modelo, método de pago y DNI
				if (brandMatch) lastFlow.brand = brandMatch[1].trim();
				if (modelMatch) lastFlow.model = modelMatch[1].trim();
				if (paymentMatch) lastFlow.payment = paymentMatch[1].trim();
				if (dniMatch) lastFlow.dni = parseInt(dniMatch[1]);
				if (priceMatch) lastFlow.price = priceMatch[1].trim();
				if (questionsMatch) lastFlow.questions = questionsMatch[1].trim();

				// Cambio del status del lead
				lastFlow.client_status = "esperando";
				lastFlow.history += `${currentDateTime} - Status: esperando. `;
				
			} else if (userMessage.wamId_Flow1){
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
