import Leads from "../../models/leads.js";

// Graba respuestas del FLOW 2 y devuelve los datos del Lead para notificarlo
export const findLeadWithFlowToken2 = async (
	notification,
	vendorPhone,
	vendorName,
	senderName
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
			"flows.flow_2token": notification.flowToken,
		});

		const flow = lead.flows.find(
			(flow) => flow.flow_2token === notification.flowToken
		);
		flow.vendor_name = vendorName;
		flow.vendor_phone = vendorPhone;
		flow.vendor_notes = notification.notes;
		flow.client_status = notification.status;

		if (notification.days) {
			// Si es a contactar más tarde
			let futureDate = new Date();

			// Convertir notification.days a número y validar
			const daysToAdd = parseInt(notification.days);
			if (isNaN(daysToAdd)) {
				throw new Error("notification.days debe ser un número válido");
			}
			console.log("not",notification.days)
			console.log("days to add",daysToAdd)

			futureDate.setDate(futureDate.getDate() + daysToAdd);
			const futureArgDate = new Date(futureDate.toLocaleString('es-AR', {
				timeZone: 'America/Argentina/Buenos_Aires'
			}));
			console.log("future", futureDate)

			flow.toContact = futureArgDate;
			flow.history += `${currentDateTime} - Status: a contactar por ${vendorName} en ${notification.days} días. `;
		
		} else if (!notification.days && !notification.delegate) {
			// Si es a atender ahora
			flow.history += `${currentDateTime} - Status: ${notification.status} ${vendorName}. `;
		} else if (notification.delegate) {
			// Se derivó a otro vendedor
			flow.history += `${currentDateTime} - Status: ${senderName} - ${notification.delegate}.`;
		}

		await lead.save();

		const customerPhone = lead.id_user;
		const customerName = lead.name;
		const brand = flow.brand;
		const model = flow.model;
		const price = flow.price;
		const otherProducts = flow.otherProducts;
		const payment = flow.payment;
		const dni = flow.dni;
		const questions = flow.questions;

		return {
			customerPhone,
			customerName,
			brand,
			model,
			price,
			otherProducts,
			payment,
			dni,
			questions,
		};
	} catch (error) {
		console.log(
			"error en findLeadWithFlowToken2.js:",
			error.data ? error.data : error.message
		);

		throw error;
	}
};
