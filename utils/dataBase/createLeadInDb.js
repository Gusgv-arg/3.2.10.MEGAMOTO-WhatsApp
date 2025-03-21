import Leads from "../../models/leads.js";
import { v4 as uuidv4 } from "uuid";

export const createLeadInDb = async (userMessage) => {
	// Crear un FLOW 2 Token para diferenciarlo
	const flowToken2 = `2${uuidv4()}`;

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
	try {
		// Create Lead
		const lead = await Leads.create({
			name: userMessage.name,
			id_user: userMessage.userPhone,
			botSwitch: "ON",
			channel: userMessage.channel,
			flows: [
				{
					flowName: process.env.FLOW_1,
					flowDate: currentDateTime,
					flow1Response: "no",
					origin: "API General",
					client_status: "primer contacto",
					statusDate: currentDateTime,
					messages: "",
					history: `${currentDateTime} - Status: primer contacto. `,
					flow_2token: flowToken2,
					flow_status: "activo",
				},
			],
		});

		// Save lead in DB
		await lead.save();
	} catch (error) {
		const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		console.log("Error en createLeadInDb.js:", errorMessage);

		throw errorMessage;
	}
};
