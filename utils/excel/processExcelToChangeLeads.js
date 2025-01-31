import xlsx from "xlsx";
import Leads from "../../models/leads.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";
import { v4 as uuidv4 } from "uuid";

// Importar los enums desde el esquema de Leads
//const validClientStatuses = Object.values(Leads.schema.paths.flows.schema.paths.client_status.enum);
const validClientStatuses = Leads.schema.path("flows.client_status").enumValues;

// Función para transformar strings sin acento a con acento
const transformToAccented = (status) => {
	if (status === "" || status === undefined || status === null) {
		status = "vendedor";
	}
	const transformations = {
		compro: "compró",
		"no compro": "no compró",
		"sin definicion": "sin definición",
		"sin definir": "sin definición",
	};

	return transformations[status.toLowerCase()] || status;
};

const vendors = [
	{ name: "gustavo glunz", phone: process.env.PHONE_GUSTAVO_GLUNZ },
	{
		name: "gustavo gomez villafane",
		phone: process.env.PHONE_GUSTAVO_GOMEZ_VILLAFANE,
	},
];

export const processExcelToChangeLeads = async (excelBuffer, userPhone) => {
	console.log("validClientStatuses:", validClientStatuses);
	try {
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Leer como array de arrays

		console.log("Total rows to process:", data.length);

		const errorMessages = []; // Array para acumular mensajes de error

		for (let i = 1; i < data.length; i++) {
			// Comenzar desde la segunda fila
			const col = data[i]; // Cada fila es un array
			const name = col[0];
			const id_user = col[1] ? String(col[1]).trim() : null; // Columna B (índice 1)
			const flow_2token = col[16] ? String(col[16]).trim() : null; // Columna Q (índice 16)

			// Validar client_status e ir acumulando errores posibles
			let client_status = col[2]; // Columna C (índice 2)
			const originalClientStatus = client_status; // Guardar el estado original

			if (!validClientStatuses.includes(client_status)) {
				// Verificar si el client_status está en las transformaciones
				const transformedStatus = transformToAccented(client_status);
				if (transformedStatus !== client_status) {
					client_status = transformedStatus;
					console.log(
						`Transformed client_status to "${client_status}" for row ${i + 1}.`
					);
				}
				// Validar nuevamente después de la transformación
				if (!validClientStatuses.includes(client_status)) {
					const errorMessage = `❌ Status inválido "${originalClientStatus}" para ${id_user}. `;
					errorMessages.push(errorMessage); // Acumular el mensaje de error
					continue;
				}
			}

			console.log("Processing row:", {
				id_user,
				flow_2token,
				client_status,
				toContact: col[4], // Columna E (índice 4)
				brand: col[5], // Columna F (índice 5)
			});

			if (!id_user) {
				console.log(`id_user is missing for row ${i + 1}. Skipping.`);
				continue;
			}

			// Buscar al vendedor en el array de vendedores
			const vendor = vendors.find(
				(v) => v.name.toLowerCase() === col[12].toLowerCase()
			); // Buscar el vendedor por nombre
			const vendorPhone = vendor ? vendor.phone : userPhone; // Obtener el teléfono si existe

			// Crear objeto con los campos modificables
			const updateData = {
				"flows.$.client_status": client_status, // Usar el client_status validado
				"flows.$.toContact": col[4] ? new Date(col[4]) : undefined, // Columna E (índice 4)
				"flows.$.brand": col[5], // Columna F (índice 5)
				"flows.$.model": col[6], // Columna G (índice 6)
				"flows.$.price": col[7], // Columna H (índice 7)
				"flows.$.otherProducts": col[8], // Columna I (índice 8)
				"flows.$.payment": col[9], // Columna J (índice 9)
				"flows.$.dni": col[10], // Columna K (índice 10)
				"flows.$.vendor_name": col[12], // Columna M (índice 12)
				"flows.$.vendor_phone": vendorPhone, // Busca en array de vendedores
				"flows.$.vendor_notes": col[13], // Columna N (índice 13)
				"flows.$.origin": col[15], // Columna P (índice 15)
			};

			// Remove undefined values
			Object.keys(updateData).forEach(
				(key) => updateData[key] === undefined && delete updateData[key]
			);

			console.log("Update data:", updateData);

			// Primero verificamos si existe el documento
			const existingLead = await Leads.findOne({
				id_user: id_user,
				...(flow_2token ? { "flows.flow_2token": flow_2token } : {}),
			});

			console.log("Found lead:", existingLead ? "Yes" : "No");

			if (!existingLead) {
				console.log(
					`No lead found for id_user: ${id_user} and flow_2token: ${flow_2token}`
				);
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

				// Si no existe, crear un nuevo registro
				const newLead = new Leads({
					id_user: id_user,
					name: name,
					botSwitch: "ON",
					channel: "whatsapp",
					flows: [
						{
							client_status: updateData["flows.$.client_status"],
							toContact: updateData["flows.$.toContact"],
							brand: updateData["flows.$.brand"],
							model: updateData["flows.$.model"],
							price: updateData["flows.$.price"],
							otherProducts: updateData["flows.$.otherProducts"],
							payment: updateData["flows.$.payment"],
							dni: updateData["flows.$.dni"],
							vendor_name: updateData["flows.$.vendor_name"],
							vendor_phone: vendorPhone,
							vendor_notes: updateData["flows.$.vendor_notes"],
							origin: updateData["flows.$.origin"],
							flow_2token: `2${uuidv4()}`, // Generar flow_2token,
							history: `${currentDateTime} Alta manual de ${userPhone}. Status - ${updateData["flows.$.client_status"]} `,
						},
					],
				});

				await newLead.save();
				continue;
			}

			// Si flow_2token no existe, actualizamos el último flujo
			const flowIndex = flow_2token
				? existingLead.flows.findIndex(
						(flow) => flow.flow_2token === flow_2token
				  )
				: existingLead.flows.length - 1; // Último flujo si flow_2token es vacío

			if (flowIndex === -1) {
				console.log(
					`No matching flow found for flow_2token: ${flow_2token}. Updating last flow instead.`
				);
			}

			// Actualizar el campo history
			const currentDateTime = new Date().toLocaleString("es-AR", {
				timeZone: "America/Argentina/Buenos_Aires",
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			const historyUpdate = `${
				existingLead.flows[flowIndex].history || ""
			} ${currentDateTime} - Status: vendedor actualizó status Lead.`;

			// Update the matching flow directly using the positional $ operator
			const result = await Leads.updateOne(
				{
					id_user: id_user,
					...(flow_2token ? { "flows.flow_2token": flow_2token } : {}),
				},
				{
					$set: {
						[`flows.${flowIndex}.client_status`]:
							updateData["flows.$.client_status"],
						[`flows.${flowIndex}.toContact`]: updateData["flows.$.toContact"],
						[`flows.${flowIndex}.brand`]: updateData["flows.$.brand"],
						[`flows.${flowIndex}.model`]: updateData["flows.$.model"],
						[`flows.${flowIndex}.price`]: updateData["flows.$.price"],
						[`flows.${flowIndex}.otherProducts`]:
							updateData["flows.$.otherProducts"],
						[`flows.${flowIndex}.payment`]: updateData["flows.$.payment"],
						[`flows.${flowIndex}.dni`]: updateData["flows.$.dni"],
						[`flows.${flowIndex}.vendor_name`]:
							updateData["flows.$.vendor_name"],
						[`flows.${flowIndex}.vendor_notes`]:
							updateData["flows.$.vendor_notes"],
						[`flows.${flowIndex}.origin`]: updateData["flows.$.origin"],
					},
					$setOnInsert: {
						// Agregar campos que no existan en el registro
						...Object.keys(updateData).reduce((acc, key) => {
							if (!existingLead.flows[flowIndex][key.split(".")[1]]) {
								acc[`flows.${flowIndex}.${key.split(".")[1]}`] =
									updateData[key];
							}
							return acc;
						}, {}),
					},
				}
			);

			console.log("Update result:", result);
		}

		// Si hay mensajes de error, enviarlos al usuario
		if (errorMessages.length > 0) {
			const combinedErrorMessage = errorMessages.join("\n");
			const finalMessage = `*Notificación Automática de Error al actualizar los Leads:*\n${combinedErrorMessage}\nStatus posibles: "compró", "no compró", "a contactar", "transferido al vendedor" o "sin definición".\n\nMegamoto`;

			await handleWhatsappMessage(userPhone, finalMessage);
		} else {
			await handleWhatsappMessage(
				userPhone,
				`*Notificación Automática:*\n\n✅ ¡Se actualizaron tus Leads!\n\nMegamoto`
			);
		}
	} catch (error) {
		console.error("Error completo:", error);
		await adminWhatsAppNotification(
			userPhone,
			`*NOTIFICACION de Error procesando Excel para el cambio de Status en Leads:*\n${error.message}\nMegamoto`
		);
	}
};
