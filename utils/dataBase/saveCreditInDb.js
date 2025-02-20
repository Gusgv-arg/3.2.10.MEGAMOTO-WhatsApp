import Leads from "../../models/leads.js";

export const saveCreditInDb = async (userPhone, message, credit) => {
	
	// Save the sent message to the database
	try {
		// Find the lead
		let lead = await Leads.findOne({ id_user: userPhone });

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

			// Buscar el Flow actual
			let lastFlow = lead.flows[lead.flows.length - 1];
			
			lastFlow.messages += `\n${currentDateTime} API: ${message}`;
			lastFlow.credit = credit		

			// Update lead
			await lead.save();
			return;
		}
	} catch (error) {
		const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		console.log("error en saveCreditInDb.js:", errorMessage);
		throw new Error(errorMessage);
	}
};
