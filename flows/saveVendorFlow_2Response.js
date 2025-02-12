import Leads from "../models/leads.js";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

const adminPhone = process.env.MY_PHONE

export const saveVendorFlow_2Response = async (
	senderId,
	notification,
	flowToken,
	name
) => {
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
		// Looks existent with flowToken
		let lead = await Leads.findOne({ "flows.flow_token": flowToken });

		// Check if lead and flows exist
		if (!lead || !lead.flows || lead.flows.length === 0) {
			console.log("No se encontró el lead o no tiene flujos. Teléfono:", senderId);
			return null;
		}
		//console.log("FlowToken recibido en saveVendroFlow_2", flowToken);

		// Find the specific flow to update
		const flowToUpdate = lead.flows.find(
			(flow) => flow.flow_2token === flowToken
		);

		let customerQuestion = [];
		let vendorPhone;
		let vendorName;

		if (flowToUpdate) {
			// Update existing lead
			if (
				notification.includes("Respuesta del Vendedor: Atender") &&
				!notification.includes("más tarde")
			) {
				flowToUpdate.messages += `\n${currentDateTime} - API: se envió WhatsApp al cliente que será atendido por ${name}`;
				flowToUpdate.client_status = "vendedor";
				flowToUpdate.vendor_phone = senderId;
				flowToUpdate.vendor_name = name;
				flowToUpdate.history += `${currentDateTime} - Status Cliente: Vendedor ${name} `;
				//console.log(`El vendedor ${name} aceptó atender al cliente ${lead.name}`);

				vendorPhone = senderId;
				vendorName = name;
			} else if (
				notification.includes("Respuesta del Vendedor: Atender más tarde")
			) {
				flowToUpdate.messages += `\n${currentDateTime} - API: se envió WhatsApp al cliente que será atendido más tarde por ${name}`;
				flowToUpdate.client_status = "vendedor más tarde";
				flowToUpdate.vendor_phone = senderId;
				flowToUpdate.vendor_name = name;
				flowToUpdate.history += `${currentDateTime} - Status Cliente: Vendedor ${name} más tarde. `;
				//console.log(`El vendedor ${name} aceptó atender al cliente ${lead.name} más tarde!!`);
				vendorPhone = senderId;
				vendorName = name;

			} else if (notification.includes("Derivación a Vendedor:")) {
				// Buscar la consulta del cliente
				customerQuestion = flowToUpdate.messages.match(
					/Marca(.*?)¡Gracias por confiar en Megamoto!/s
				)[0];
				//console.log("customerQuestion:", customerQuestion);

				if (notification.includes("Gustavo Glunz")) {
					flowToUpdate.client_status = "vendedor derivado";
					flowToUpdate.vendor_phone = process.env.PHONE_GUSTAVO_GLUNZ;
					flowToUpdate.vendor_name = "Gustavo Glunz";
					flowToUpdate.history += `${currentDateTime} - Status Cliente: Vendedor ${name} derivó su cliente a Gustavo Glunz. `;
					//console.log(`El vendedor ${name} derivó su cliente ${lead.name} al vendedor Gustavo Glunz.`);

					vendorPhone = process.env.PHONE_GUSTAVO_GLUNZ;
					vendorName = "Gustavo Glunz";

				} else if (notification.includes("Gustavo Gómez Villafañe")) {
					flowToUpdate.client_status = "vendedor derivado";
					flowToUpdate.vendor_phone = process.env.MY_PHONE;
					flowToUpdate.vendor_name = "Gustavo Gómez Villafañe";
					flowToUpdate.history += `${currentDateTime} - Status Cliente: Vendedor ${name} derivó su cliente a Gustavo Gómez Villafañe. `;
					//console.log(`El vendedor ${name} derivó su cliente ${lead.name} al vendedor Gustvo Gómez Villafañe.`);
					
					vendorPhone = process.env.MY_PHONE;
					vendorName = "Gustavo Gómez Villafañe";
				}
				
			} else {
				console.log(
					"NO SE ESTA GRABANDO NADA en saveVendorFlow_2Response.js!!"
				);
			}
		} else {
			console.log("NO SE ESTA GRABANDO NADA en saveVendorFlow_2Response.js!!");
		}

		await lead.save();

		const customerName = lead.name;
		const customerPhone = lead.id_user;

		return {
			customerName,
			customerPhone,
			vendorPhone,
			vendorName,
			customerQuestion,
		};
	} catch (error) {
		const errorMessage = error?.response?.data
		? JSON.stringify(error.response.data)
		: error.message

		console.error(
			"Error en saveVendorFlow_2Response.js:",
			errorMessage
		);

		// Receives the throw new error && others
		const message = `🔔 *NOTIFICACION DE ERROR en saveVendorFlow_2Response.js:*\nError: ${errorMessage} `
		
		await adminWhatsAppNotification(adminPhone, message);
	}
};
