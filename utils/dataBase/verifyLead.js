import Leads from "../../models/leads.js";
import { v4 as uuidv4 } from "uuid";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";
import { verifyWhatsAppNumber } from "../whatsapp/verifyWhatsAppNumber.js";

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

// Función que verifica si el vendedor envió un teléfono para verificar el lead
export const verifyLead = async (userPhone, vendorName, message) => {
	// Verificar si el mensaje contiene un número con al menos 10 cifras
	const regexContainsNumber = /\d{5,}/; // Para verificar si contiene un número con al menos 5 cifras
	const regexExtractNumber = /(\d{10,})\s*(.+)?/; // Expresión regular para extraer el número de teléfono de al menos 10 cifras y el resto del mensaje

	if (!regexContainsNumber.test(message)) {
		return false; // Si no contiene un número con al menos 8 cifras, retornar false
	}

	const match = message.match(regexExtractNumber);

	if (!match) {
		// Si contiene un número pero no llega a 10 cifras se notifica al usuario
		const errorMessage = `*🔔 Notificación MEGAMOTO:*\n\n❌ Parece que estas queriendo verificar un celular. El número debe comenzar con código de área sin 0 + número sin el 15 adelante (10 cifras como mínimo). Por favor, verifica el formato e intenta nuevamente.\n\n*Megamoto*`;

		await handleWhatsappMessage(userPhone, errorMessage);
		return true;
	}

	// Extraer el id_user y el nombre del mensaje
	let id_user = match[1].trim(); // Primer grupo: las 5 o más cifras

	// Agregar el prefijo "549" si no está presente
	if (!id_user.startsWith("549")) {
		id_user = `549${id_user}`;
	}

	const name = match[2] ? match[2].trim() : ""; // Segundo grupo: el resto del mensaje

	try {
		// Buscar en la base de datos si el id_user existe
		let user = await Leads.findOne({ id_user });

		if (!user) {
			// Si no existe, verificar el número enviando whatsapp al lead
			const notification = `*🔔 Notificación MEGAMOTO:*\n\n¡👋 Hola!. Te informamos que tu vendedor asignado es ${vendorName} y su celular es el ${userPhone}. Por favor agendalo.\n\n*¡Gracias por confiar en Megamoto!*`;

			// ACA EN LUGAR DE UN MENSAJE TENGO QUE USAR UN WHATSAPP TEMPLATE!!!
			const correctNumber = await verifyWhatsAppNumber(id_user, notification);

			if (correctNumber === true) {
				// Si el mensaje es enviado correctamente crear un nuevo registro en la base de datos

				const flow_2token = `2+${uuidv4()}`;

				user = new Leads({
					id_user,
					name,
					channel: "whatsapp",
					botSwitch: "ON",
					flows: [
						{
							flowName: "registro manual",
							flowDate: currentDateTime,
							client_status: "vendedor",
							statusDate: currentDateTime,
							vendor_phone: userPhone,
							vendor_name: vendorName,
							origin: "Salón",
							history: `${currentDateTime} Alta manual por ${vendorName}.`,
							flow_2token,
							flow_status: "activo",
						},
					],
				});

				await user.save();
				console.log(`Nuevo registro creado para id_user: ${id_user} por parte de ${vendorName}`);

				// Notificar al usuario que se ha creado un nuevo registro
				const message = `*🔔 Notificación MEGAMOTO:*\n\n✅ Tu lead con el teléfono ${id_user} fue creado exitosamente. Para completar el resto de los datos podés enviar la palabra "leads", recibir el Excel y volver a enviarlo con toda la información de la operación.\n\n*Megamoto*`;

				await handleWhatsappMessage(userPhone, message);
				return true;

			} else {
				// Si el mensaje no se envía correctamente, notificar al vendedor que el lead no existe
				const errorMessage = `*🔔 Notificación MEGAMOTO:*\n\n❌ El teléfono ${id_user} no pudo ser enviado al cliente. Por favor verificá el formato e intentá nuevamente.\n\n*Megamoto*`;

				await handleWhatsappMessage(userPhone, errorMessage);
				return true;
			}
		} else {
			// Si el usuario ya existe, verificar el último flow_status
			const lastFlow = user.flows[user.flows.length - 1];

			if (
				lastFlow &&
				lastFlow.flow_status !== "compró" &&
				lastFlow.flow_status !== "no compró"
			) {
				// Si el último flow_status es distinto de "compró" o "no compró"
				const message = `*🔔 Notificación MEGAMOTO:*\n\n❌ El lead tiene una operación en curso.\nVendedor: ${lastFlow.vendor_name}\nTeléfono: ${lastFlow.vendor_phone}\n\n*Megamoto*`;

				await handleWhatsappMessage(userPhone, message);

				return true;
			} else {
				// Si el último flow_status es "compró" o "no compró", agregar un nuevo registro en flows
				const flow_2token = `2+${uuidv4()}`;

				const newFlow = {
					flowName: "registro manual",
					flowDate: currentDateTime,
					client_status: "vendedor",
					statusDate: currentDateTime,
					origin: "Salón",
					vendor_phone: userPhone,
					vendor_name: vendorName,
					history: `${currentDateTime} Alta manual por ${vendorName}.`,
					flow_2token,
					flow_status: "activo",
				};

				user.flows.push(newFlow);
				await user.save();

				console.log(`Nuevo flow agregado para id_user: ${id_user}`);

				const message = `*🔔 Notificación MEGAMOTO:*\n\n✅ Tu lead con el teléfono ${id_user} fue creado exitosamente y NO es la primera vez que nos consulta. Para completar el resto de los datos podés enviar la palabra "leads", recibir el Excel y volver a enviarlo con toda la información de la operación.\n\n*Megamoto*`;

				await handleWhatsappMessage(userPhone, message);

				return true;
			}
		}
	} catch (error) {
		console.error("Error en verifyLead.js:", error);
		const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		throw new Error(errorMessage);
	}
};
