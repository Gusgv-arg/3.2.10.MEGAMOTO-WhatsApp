import Leads from "../../models/leads.js";

export const saveReminderInDb = async (userMessage, notification) => {
	//console.log("userMessage en saveReminderInDb:", userMessage);
	//console.log("notification en saveReminderInDb:", notification);

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

	// Save the sent message to the database
	try {
		// Find the lead
		let lead = await Leads.findOne({ id_user: userMessage.userPhone });

		// If the lead does not exist for that thread, there is an error and returns.
		if (lead === null) {
			console.log("¡¡ERROR: Lead not found in DB!!");
			return;
		} else {
			// Obtener el último flujo
			let lastFlow = lead.flows[lead.flows.length - 1];

			// Si el último flow está cerrado agregar un flow nuevo al array de flows
			if (
				lastFlow.client_status === "compró" ||
				lastFlow.client_status === "no compró"
			) {
				// Crear un token 2 y un nuevo flujo para agregarlo al array
				const flowToken2 = `2${uuidv4()}`;

				lastFlow = {
					flowName: process.env.FLOW_1,
					flowDate: currentDateTime,
					client_status: status,
					messages: `\n${currentDateTime} ${userMessage.name}: ${userMessage.message}\n${currentDateTime} - API: ${notification.message}`,
					history: history ? history : "",
					flow_2token: flowToken2,
					flow_status: "activo",
					origin: "API General",
					brand: notification.brand,
					model: notification.model,
					otherProducts: notification.otherProducts,
					price: notification.price,
					payment: notification.payment,
					dni: notification.dni,
					credit: "",
					questions: notification.questions,
					wamId_flow1: wamId_flow1 ? wamId_flow1 : "",
				};
				lead.flows.push(lastFlow); // Agrega el nuevo flujo al array
			} else {
				// Hay un Flow abierto

				// Actualizo la información
				(lastFlow.messages += `\n${currentDateTime} ${userMessage.name}: ${userMessage.message}\n${currentDateTime} - API: ${notification.message}`),
					(lastFlow.brand =
						notification?.brand !== "" ? notification.brand : lastFlow.brand);
				lastFlow.model = notification?.model;
				lastFlow.price = notification?.price;
				lastFlow.otherProducts = notification?.otherProducts;
				lastFlow.payment = notification?.payment;
				lastFlow.dni = notification?.dni;
				lastFlow.questions = notification?.questions;
				lastFlow.client_status = status ? status : lastFlow.client_status;
				lastFlow.history += history ? history : "";
				// Grabo el wamId para oder traquearlo
				lastFlow.wamId_flow1 = wamId_flow1 ? wamId_flow1 : "";
			}

			// Update lead
			await lead.save();
			return;
		}
	} catch (error) {
		const errorMessage = `Error en saveReminderInDb.js: ${error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message}`;

		console.log("error en saveReminderInDb.js:", errorMessage);
		throw new Error(errorMessage);
	}
};
