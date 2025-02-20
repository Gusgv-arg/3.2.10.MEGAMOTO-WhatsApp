import Leads from "../../models/leads.js";

export const saveNotificationInDb = async (userMessage, notification) => {
	//console.log("extraction en saveNotification:", notification);

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

			// Definir el Flow abierto actual
			let lastFlow;
			if (
				lead.flows[lead.flows.length - 1].client_status !== "compró" &&
				lead.flows[lead.flows.length - 1].client_status !== "no compró"
			) {
				lastFlow = lead.flows[lead.flows.length - 1];
			} else {
				last = { 
					messages: "", 
					client_status: "", 
					history: "", 
				};
				lastFlow = lead.flows.push(last)
			}

			if (userMessage.message) {
				lastFlow.messages += `\n${currentDateTime} ${userMessage.name}: ${userMessage.message}\n${currentDateTime} - API: ${notification.message}`;
			} else {
				lastFlow.messages += `\n$${currentDateTime} - API: ${notification.message}`;
			}

			// Actualizar estado y history del lead
			if (notification.message.includes("IMPORTANTE")) {
				// Casos de faltantes de informacion en el FLOW 1

				if (notification.message.includes("modelo de interes y tu DNI")) {
					// Si falta el modelo y el DNI
					lastFlow.client_status = "faltan modelo y DNI";
					lastFlow.history += `${currentDateTime} - Status: faltan modelo y DNI. `;
				} else if (notification.message.includes("préstamo")) {
					// Si falta el DNI
					lastFlow.client_status = "falta DNI";
					lastFlow.history += `${currentDateTime} - Status: falta DNI. `;
				} else if (notification.message.includes("modelo")) {
					// Si falta modelo
					lastFlow.client_status = "falta modelo";
					lastFlow.history += `${currentDateTime} - Status: falta modelo. `;
				}
			} else if (
				notification.message.includes("¡Gracias por confiar en MEGAMOTO!")
			) {
				// Envío completo del FLOW 1
				lastFlow.brand = notification.brand;
				lastFlow.model = notification.model;
				lastFlow.price = notification.price;
				lastFlow.otherProducts = notification.otherProducts;
				lastFlow.payment = notification.payment;
				lastFlow.dni = notification.dni;
				lastFlow.questions = notification.questions;
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
		const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		console.log("error en saveNotificationInDb.js:", errorMessage);
		throw new Error(errorMessage);
	}
};
