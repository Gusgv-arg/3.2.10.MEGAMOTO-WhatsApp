import xlsx from "xlsx";
import Leads from "../../models/leads.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";

const validClientStatuses = [
	"compró",
	"no compró",
	"a contactar",
	"transferido al vendedor",
	"sin definición",
];

// Función para transformar strings sin acento a con acento
const transformToAccented = (status) => {
	const transformations = {
		"no compro": "no compró",
		"sin definicion": "sin definición",
		"a contactar": "a contactar",
		"transferido al vendedor": "transferido al vendedor",
	};
	return transformations[status.toLowerCase()] || status;
};

export const processExcelToChangeLeadStatus = async (
	excelBuffer,
	userPhone
) => {
	try {
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Leer como array de arrays

		console.log("Total rows to process:", data.length);

		for (let i = 1; i < data.length; i++) {
			// Comenzar desde la segunda fila
			const col = data[i]; // Cada fila es un array
			const id_user = col[1] ? String(col[1]).trim() : null; // Columna B (índice 1)
			const flow_2token = col[14] ? String(col[14]).trim() : null; // Columna O (índice 14)

			// Validar client_status y sino cortar ejecución
			let client_status = col[2]; // Columna C (índice 2)
			if (!validClientStatuses.includes(client_status)) {
				client_status = transformToAccented(client_status);
				if (!validClientStatuses.includes(client_status)) {
					const errorMessage = `*Notificación Automática:*\n❌ El Status del lead es inválido "${col[2]}" para ${id_user}.\nStatus de Leads posibles: "compró",	"no compró", "a contactar",	"transferido al vendedor" o	"sin definición".\n\nMegamoto `;

					await handleWhatsappMessage(userPhone, errorMessage);
					return;
				}
				console.log(
					`Transformed client_status to "${client_status}" for row ${i + 1}.`
				);
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

			// Create update object with only the fields that exist in the Excel
			const updateData = {
				"flows.$.client_status": client_status, // Usar el client_status validado
				"flows.$.toContact": col[4] ? new Date(col[4]) : undefined, // Columna E (índice 4)
				"flows.$.brand": col[5], // Columna F (índice 5)
				"flows.$.model": col[6], // Columna G (índice 6)
				"flows.$.price": col[7], // Columna H (índice 7)
				"flows.$.payment": col[8], // Columna I (índice 8)
				"flows.$.dni": col[9], // Columna J (índice 9)
				"flows.$.questions": col[10], // Columna K (índice 10)
				"flows.$.vendor_name": col[11], // Columna L (índice 11)
				"flows.$.vendor_phone": col[12], // Columna M (índice 12)
				"flows.$.vendor_notes": col[13], // Columna N (índice 13)
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
						[`flows.${flowIndex}.payment`]: updateData["flows.$.payment"],
						[`flows.${flowIndex}.dni`]: updateData["flows.$.dni"],
						[`flows.${flowIndex}.questions`]: updateData["flows.$.questions"],
						[`flows.${flowIndex}.vendor_name`]:
							updateData["flows.$.vendor_name"],
						[`flows.${flowIndex}.vendor_phone`]:
							updateData["flows.$.vendor_phone"],
						[`flows.${flowIndex}.vendor_notes`]:
							updateData["flows.$.vendor_notes"],
						[`flows.${flowIndex}.history`]: historyUpdate,
					},
				}
			);

			console.log("Update result:", result);
		}

		await handleWhatsappMessage(
			userPhone,
			`*Notificación Automática:*\n✅ ¡Se actualizaron tus Leads!\n\nMegamoto`
		);
	} catch (error) {
		console.error("Error completo:", error);
		await adminWhatsAppNotification(
			userPhone,
			`*NOTIFICACION de Error procesando Excel para el cambio de Status en Leads:*\n${error.message}`
		);
	}
};
