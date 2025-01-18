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

			let lastFlow = lead.flows[lead.flows.length - 1];
			lastFlow.messages += `\n${currentDateTime} ${userMessage.name}: ${userMessage.message}\n${currentDateTime} - API: ${notification}`;
			lastFlow.history += `${currentDateTime} - API: notificación enviada. `;

			// Update lead
			await lead.save();
			return;
		}
	} catch (error) {
		console.log("error en saveNotificationInDb.js:", error.message)
        throw new Error(error.message);
	}
};
