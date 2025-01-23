import xlsx from "xlsx";
import Leads from "../../models/leads.js";
import {adminWhatsAppNotification} from "../notifications/adminWhatsAppNotification.js"

export const processExcelToChangeLeadStatus = async (excelBuffer, userPhone) => {
	try {
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Leer como array de arrays

		console.log('Total rows to process:', data.length);

		for (let i = 1; i < data.length; i++) { // Comenzar desde la segunda fila
			const col = data[i]; // Cada fila es un array
			const id_user = col[1] ? String(col[1]).trim() : null; // Columna B (índice 1)
			const flow_2token = col[14] ? String(col[14]).trim() : null; // Columna O (índice 14)

			console.log('Processing row:', {
				id_user,
				flow_2token,
				client_status: col[2], // Columna C (índice 2)
				toContact: col[4], // Columna E (índice 4)
				brand: col[5] // Columna F (índice 5)
			});

			if (!id_user) {
				console.log(`id_user is missing for row ${i + 1}. Skipping.`);
				continue;
			}

			// Create update object with only the fields that exist in the Excel
			const updateData = {
				'flows.$.client_status': col[2], // Columna C (índice 2)
				'flows.$.toContact': col[4] ? new Date(col[4]) : undefined, // Columna E (índice 4)
				'flows.$.brand': col[5], // Columna F (índice 5)
				'flows.$.model': col[6], // Columna G (índice 6)
				'flows.$.price': col[7], // Columna H (índice 7)
				'flows.$.payment': col[8], // Columna I (índice 8)
				'flows.$.dni': col[9], // Columna J (índice 9)
				'flows.$.questions': col[10], // Columna K (índice 10)
				'flows.$.vendor_name': col[11], // Columna L (índice 11)
				'flows.$.vendor_phone': col[12] // Columna M (índice 12)
			};

			// Remove undefined values
			Object.keys(updateData).forEach(key => 
				updateData[key] === undefined && delete updateData[key]
			);

			console.log('Update data:', updateData);

			// Primero verificamos si existe el documento
			const existingLead = await Leads.findOne({
				id_user: id_user,
				...(flow_2token ? { 'flows.flow_2token': flow_2token } : {})
			});

			console.log('Found lead:', existingLead ? 'Yes' : 'No');

			if (!existingLead) {
				console.log(`No lead found for id_user: ${id_user} and flow_2token: ${flow_2token}`);
				continue;
			}

			// Si flow_2token no existe, actualizamos el último flujo
			const flowIndex = flow_2token ? 
				existingLead.flows.findIndex(flow => flow.flow_2token === flow_2token) : 
				existingLead.flows.length - 1; // Último flujo si flow_2token es vacío

			if (flowIndex === -1) {
				console.log(`No matching flow found for flow_2token: ${flow_2token}. Updating last flow instead.`);
			}

			// Update the matching flow directly using the positional $ operator
			const result = await Leads.updateOne(
				{ 
					id_user: id_user,
					...(flow_2token ? { 'flows.flow_2token': flow_2token } : {})
				},
				{ 
					$set: {
						[`flows.${flowIndex}.client_status`]: updateData['flows.$.client_status'],
						[`flows.${flowIndex}.toContact`]: updateData['flows.$.toContact'],
						[`flows.${flowIndex}.brand`]: updateData['flows.$.brand'],
						[`flows.${flowIndex}.model`]: updateData['flows.$.model'],
						[`flows.${flowIndex}.price`]: updateData['flows.$.price'],
						[`flows.${flowIndex}.payment`]: updateData['flows.$.payment'],
						[`flows.${flowIndex}.dni`]: updateData['flows.$.dni'],
						[`flows.${flowIndex}.questions`]: updateData['flows.$.questions'],
						[`flows.${flowIndex}.vendor_name`]: updateData['flows.$.vendor_name'],
						[`flows.${flowIndex}.vendor_phone`]: updateData['flows.$.vendor_phone']
					}
				}
			);

			console.log('Update result:', result);
		}

		await adminWhatsAppNotification(userPhone, `✅ Excel procesado exitosamente. Se actualizaron los leads correspondientes.`);

	} catch (error) {
		console.error("Error completo:", error);
		await adminWhatsAppNotification(userPhone, `*NOTIFICACION de Error procesando Excel para el cambio de Status en Leads:*\n${error.message}`);
	}
};