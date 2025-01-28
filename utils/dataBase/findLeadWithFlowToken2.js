import Leads from "../../models/leads.js";

// Graba respuestas del FLOW 2 y devuelve los datos del Lead para notificarlo
export const findLeadWithFlowToken2 = async (
	flowToken,
	vendorPhone,
	vendorName,
	status,
	days,
	delegate,
	notes
) => {
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
		const lead = await Leads.findOne({
            "flows.flow_2token": flowToken,
		});
        
		const flow = lead.flows.find((flow) => flow.flow_2token === flowToken);
		flow.vendor_name = vendorName;
		flow.vendor_phone = vendorPhone;
        flow.vendor_notes = notes;

		if (days) {
			// Si es a contactar más tarde
			flow.client_status = "a contactar";
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + days); // Sumar días a la fecha actual
			flow.toContact = futureDate;
			flow.history += `${currentDateTime} - Status: a contactar. `;
		        
        } else if (!days && !delegate) {
			// Si es a atender ahora
			flow.client_status = status;
			flow.history += `${currentDateTime} - Status: ${status}. `;
		
        } else if (delegate) {
			// Se derivó a otro vendedor
			flow.client_status = "vendedor derivado";
			flow.history += `${currentDateTime} - Status: ${status}.` ;
		}

		await lead.save();

		const customerPhone = lead.id_user;
		const customerName = lead.name;
        const brand = flow.brand
        const model = flow.model
        const price = flow.price
        const payment = flow.payment
        const dni = flow.dni
        const questions = flow.questions
        
		return { customerPhone, customerName, brand, model, price, payment, dni, questions };
	} catch (error) {
		console.log(
			"error en findLeadWithFlowToken2.js:",
			error.data ? error.data : error.message
		);

		throw error;
	}
};
