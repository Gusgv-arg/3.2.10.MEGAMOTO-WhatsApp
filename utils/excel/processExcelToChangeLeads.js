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
	{ name: "Gustavo_Glunz", phone: process.env.PHONE_GUSTAVO_GLUNZ },
	{
		name: "Gustavo_GV",
		phone: process.env.PHONE_GUSTAVO_GOMEZ_VILLAFANE,
	},
];

export const processExcelToChangeLeads = async (excelBuffer, userPhone, vendorName) => {
	//console.log("validClientStatuses:", validClientStatuses);
	try {
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet, { 
            header: 1,
            blankrows: false,
            defval: ''  // valor por defecto para celdas vacías
        });

        // Filtrar las filas que realmente tienen datos (teléfono en columna B)
        const validRows = data.slice(1).filter(row => {
            const id_user = row[1] ? String(row[1]).trim() : '';
            // Verificar que id_user no esté vacío y sea un número válido
            return id_user && !isNaN(id_user) && id_user.length > 5;
        });

		console.log("Total rows in Excel:", data.length);
        console.log("Total valid rows to process:", validRows.length);

		const errorMessages = []; // Array para acumular mensajes de error

		for (const col of validRows) {
			// Comenzar desde la segunda fila
			const name = col[0];
			const id_user = String(col[1]).trim();
            const flow_2token = col[16] ? String(col[16]).trim() : null;

			// Validar client_status e ir acumulando errores posibles
			// EN TEORIA LO PODRIA SACAR PORQUE TRABAJO CON LISTAS DESPLEGABLES //
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

			// Si no existe, crear un nuevo registro
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

				const newLead = new Leads({
					id_user: id_user,
					name: name,
					botSwitch: "ON",
					channel: "whatsapp",
					flows: [
						{
							client_status: updateData["flows.$.client_status"] || "vendedor",
							flowDate: `${currentDateTime}`,
							toContact: updateData["flows.$.toContact"],
							brand: updateData["flows.$.brand"],
							model: updateData["flows.$.model"],
							price: updateData["flows.$.price"],
							otherProducts: updateData["flows.$.otherProducts"],
							payment: updateData["flows.$.payment"],
							dni: updateData["flows.$.dni"],
							vendor_name: vendorName,
							vendor_phone: vendorPhone,
							vendor_notes: updateData["flows.$.vendor_notes"],
							origin: updateData["flows.$.origin"] || "Salón",
							flow_2token: `2${uuidv4()}`, // Generar flow_2token,
							history: `${currentDateTime} Alta manual de ${vendorName}. Status - ${updateData["flows.$.client_status"] || "vendedor"}`,
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
			} ${currentDateTime} - ${vendorName} actualizó Leads.xls. Status: ${updateData["flows.$.client_status"]} `;

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
						[`flows.${flowIndex}.history`]: historyUpdate,
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
			const finalMessage = `🔔 *Notificación Automática:*\n\nError al actualizar los Leads:*\n${combinedErrorMessage}\n\n*Megamoto*`;

			await handleWhatsappMessage(userPhone, finalMessage);
		
		} else {
			// Notificar el éxito del proceso al usuario
			await handleWhatsappMessage(
				userPhone,
				`🔔 *Notificación Automática:*\n\n✅ ¡Se actualizaron tus Leads!\n\n*Megamoto*`
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
