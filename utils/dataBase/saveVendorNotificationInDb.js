import Leads from "../../models/leads.js";
import { v4 as uuidv4 } from "uuid";

export const saveVendorNotificationInDb = async (userMessage, notification, vendorPhone, vendorName) => {
	console.log("userMessage en saveVendorNotification:", userMessage);
	console.log("notification en saveVendorNotification:", notification);

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

			// Actualizo la información
			lastFlow.messages += `\n${currentDateTime} API: ${notification.message}`;
			lastFlow.client_status = "vendedor";
            lastFlow.vendor_name = vendorName;
            lastFlow.vendor_phone = vendorPhone;
			lastFlow.history += `${currentDateTime} Status: tomó vendedor ${vendorName}. `;			

			// Update lead
			await lead.save();
			return;
		}
	} catch (error) {
		const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		console.log("error en saveVendorNotificationInDb.js:", errorMessage);
		throw new Error(errorMessage);
	}
};
