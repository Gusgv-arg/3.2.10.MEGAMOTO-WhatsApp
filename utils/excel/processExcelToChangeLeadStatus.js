import xlsx from "xlsx";
import Leads from "../../models/leads.js";
import {adminWhatsAppNotification} from "../notifications/adminWhatsAppNotification.js"

export const processExcelToChangeLeadStatus = async (excelBuffer, userPhone) => {
	try {
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet);

		console.log('Total rows to process:', data.length);

		for (let i = 1; i < data.length; i++) {
			const col = data[i];
			const id_user = col['B'] ? String(col['B']).trim() : null; // Convertir a string y eliminar espacios
			const flow_2token = col['O'] ? String(col['O']).trim() : null; // Convertir a string y eliminar espacios

			console.log('Processing row:', {
				id_user,
				flow_2token,
				client_status: col['C'],
				toContact: col['E'],
				brand: col['F']
			});

			if (!id_user) {
				console.log(`id_user is missing for row ${i + 1}. Skipping.`);
				continue;
			}

			// Create update object with only the fields that exist in the Excel
			const updateData = {
				'flows.$.client_status': col['C'],
				'flows.$.toContact': col['E'] ? new Date(col['E']) : undefined,
				'flows.$.brand': col['F'],
				'flows.$.model': col['G'],
				'flows.$.price': col['H'],
				'flows.$.payment': col['I'],
				'flows.$.dni': col['J'],
				'flows.$.questions': col['K'],
				'flows.$.vendor_name': col['L'],
				'flows.$.vendor_phone': col['M']
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
			await Leads.updateOne(
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