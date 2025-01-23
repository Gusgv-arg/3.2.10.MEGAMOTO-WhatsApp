import axios from "axios";
import xlsx from "xlsx";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import Leads from "../../models/leads.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const processExcelToChangeLeadStatus = async (
	excelBuffer,
	userPhone
) => {
	try {
		
		// Process Excel file
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet);

		for (const col of data) {
			const id_user = col['B'];
			const flow_2token = col['O'];

			// Create update object with only the fields that exist in the Excel
			const updateData = {
				'flows.$.client_status': col['C'],
				'flows.$.toContact': col['E'],
				'flows.$.brand': col['F'],
				'flows.$.model': col['G'],
				'flows.$.price': col['H'],
				'flows.$.payment': col['I'],
				'flows.$.dni': col['J'],
				'flows.$.questions': col['K'],
				'flows.$.vendor_name': col['L'],
				'flows.$.vendor_phone': col['M']
			};

			// Update the matching flow directly using the positional $ operator
			await Leads.updateOne(
				{ 
					id_user: id_user,
					'flows.flow_2token': flow_2token 
				},
				{ $set: updateData }
			);
		}

		await adminWhatsAppNotification(userPhone, `*Notificación Automática:* ✅ Excel procesado exitosamente. Se actualizaron los leads correspondientes.\n\nMegamoto`);		
		
		} catch (error) {
		console.error("Error en processExcelToChangeLeadStatus.js:", error.message);
		// Receives the throw new error
		await adminWhatsAppNotification(userPhone, `*NOTIFICACION de Error procesando Excel para el cambio de Status en Leads:*\n${error.message}`);
	}
};
