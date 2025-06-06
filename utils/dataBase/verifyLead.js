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

// Función para normalizar números de Argentina
const normalizeArgentinePhone = (phone) => {
	console.log("Entrada:", phone);

	// Si el número no empieza con 549, lo consideramos inválido
	if (!phone.startsWith("549")) return phone;

	// Primero verificamos si el número tiene el formato 549 + 15 + resto
	if (phone.substring(3, 5) === "15") {
		// Si empieza con 15, lo movemos después del código de área
		const normalizedNumber = `54911${phone.substring(5)}`;
		console.log("Normalizado (moviendo 15):", normalizedNumber);
		return normalizedNumber;
	}

	// Extraemos el área y el resto del número
	const area = phone.substring(3, 5);
	const rest = phone.substring(5);

	console.log("Procesando:", { area, rest });

	// Si después del área está el 15, lo removemos
	if (rest.startsWith("15")) {
		const normalized = `549${area}${rest.substring(2)}`;
		console.log("Normalizado (removiendo 15):", normalized);
		return normalized;
	}

	// Si no hay 15, devolvemos el número original
	console.log("Sin cambios:", phone);
	return phone;
};

// Función que verifica si el vendedor envió un teléfono para verificar el lead
export const verifyLead = async (vendorPhone, vendorName, message) => {
	// Verificar si el mensaje contiene un número con al menos 5 cifras
	const regexContainsNumber = /\d{5,}/;
	const regexExtractNumber = /(\d{10,})\s*(.+)?/;

	if (!regexContainsNumber.test(message)) {
		return false;
	}

	const match = message.match(regexExtractNumber);

	if (!match) {
		const errorMessage = `*🔔 Notificación MEGAMOTO:*\n\n❌ Parece que estas queriendo verificar un celular. El número debe comenzar con código de área sin 0 + número sin el 15 adelante (10 cifras como mínimo). Por favor, verificá el formato e intentá nuevamente.\n\n*Megamoto*`;
		await handleWhatsappMessage(vendorPhone, errorMessage);
		console.log(
			`El vendedor ${vendorName} recibió el siguiente mensaje: ${errorMessage}`
		);
		return true;
	}

	// Extraer el id_user y el nombre del mensaje
	let customerPhone = match[1].trim();

	// Agregar el prefijo "549" si no está presente
	if (!customerPhone.startsWith("549")) {
		customerPhone = `549${customerPhone}`;
	}

	// Normalizar el número de teléfono
	customerPhone = normalizeArgentinePhone(customerPhone);

	const name = match[2] ? match[2].trim() : "estimado cliente";

	try {
		// Buscar en la base de datos si el id_user existe (usando el número normalizado)
		const normalizedPhone = normalizeArgentinePhone(customerPhone);
		console.log("Número normalizado a buscar:", normalizedPhone);

		let user = await Leads.findOne({ id_user: normalizedPhone });

		if (!user) {
			// Verificar el número normalizado
			const correctNumber = await verifyWhatsAppNumber(
				customerPhone,
				name,
				vendorPhone,
				vendorName
			);

			if (correctNumber === true) {
				const flow_2token = `2${uuidv4()}`;

				user = new Leads({
					id_user: customerPhone,
					name,
					channel: "whatsapp",
					botSwitch: "ON",
					flows: [
						{
							flowName: "registro manual",
							flowDate: currentDateTime,
							client_status: "vendedor",
							statusDate: currentDateTime,
							vendor_phone: vendorPhone,
							vendor_name: vendorName,
							origin: "Salón",
							history: `${currentDateTime} Alta manual por ${vendorName}.`,
							flow_2token,
							flow_status: "activo",
						},
					],
				});

				await user.save();
				console.log(
					`Nuevo lead creado para id_user ${customerPhone} ${
						name ? name : "sin nombre"
					} por parte del vendedor ${vendorName}`
				);

				const message = `*🔔 Notificación MEGAMOTO:*\n\n✅ Tu lead con el teléfono *${customerPhone}* y nombre *${
					name ? name : "Sin nombre"
				}* fue creado exitosamente. Para completar el resto de los datos podés enviar la palabra "leads", recibir el Excel y volver a enviarlo con toda la información de la operación.\n\n*Megamoto*`;
				await handleWhatsappMessage(vendorPhone, message);
				return true;
			} else {
				const errorMessage = `*🔔 Notificación MEGAMOTO:*\n\n❌ El teléfono ${customerPhone} no pudo ser enviado al cliente. Por favor verificá el formato e intentá nuevamente.\n\n*Megamoto*`;
				await handleWhatsappMessage(vendorPhone, errorMessage);
				console.log(
					`El vendedor ${vendorName} recibió el siguiente mensaje: ${errorMessage}`
				);
				return true;
			}
		} else {
			const lastFlow = user.flows[user.flows.length - 1];

			if (
				lastFlow &&
				lastFlow.client_status !== "compró" &&
				lastFlow.client_status !== "no compró"
			) {
				const message = `*🔔 Notificación MEGAMOTO:*\n\n❌ El lead tiene una operación en curso.\nVendedor: ${lastFlow.vendor_name}\nTeléfono: ${lastFlow.vendor_phone}\n\n*Megamoto*`;
				await handleWhatsappMessage(vendorPhone, message);
				console.log(
					`El vendedor ${vendorName} recibió el siguiente mensaje: ${message}`
				);
				return true;
			} else {
				const flow_2token = `2${uuidv4()}`;
				const newFlow = {
					flowName: "registro manual",
					flowDate: currentDateTime,
					client_status: "vendedor",
					statusDate: currentDateTime,
					origin: "Salón",
					vendor_phone: vendorPhone,
					vendor_name: vendorName,
					history: `${currentDateTime} Alta manual por ${vendorName}.`,
					flow_2token,
					flow_status: "activo",
				};

				user.flows.push(newFlow);
				await user.save();
				console.log(
					`Nuevo flow agregado para id_user: ${customerPhone} por parte del vendedor ${vendorName}`
				);

				const message = `*🔔 Notificación MEGAMOTO:*\n\n✅ Tu lead con el teléfono ${customerPhone} fue creado exitosamente y NO es la primera vez que nos consulta. Para completar el resto de los datos podés enviar la palabra "leads", recibir el Excel y volver a enviarlo con toda la información de la operación.\n\n*Megamoto*`;
				await handleWhatsappMessage(vendorPhone, message);
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
