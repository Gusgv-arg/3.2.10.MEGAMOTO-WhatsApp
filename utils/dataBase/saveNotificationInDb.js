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
				lastFlow.client_status = "respuesta";
				lastFlow.history += `${currentDateTime} - Status: respuesta. `;
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
