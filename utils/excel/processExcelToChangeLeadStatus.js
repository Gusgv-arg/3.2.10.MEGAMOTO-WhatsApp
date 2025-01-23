export const processExcelToChangeLeadStatus = async (excelBuffer, userPhone) => {
	try {
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet);

		console.log('Total rows to process:', data.length);

		// Comenzar desde la segunda fila (índice 1)
		for (let i = 1; i < data.length; i++) {
			const col = data[i]; // Cambiar a col para la fila actual
			const id_user = col['B'];
			const flow_2token = col['O'];

			console.log('Processing row:', {
				id_user,
				flow_2token,
				client_status: col['C'],
				toContact: col['E'],
				brand: col['F']
			});

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
				'flows.flow_2token': flow_2token
			});

			console.log('Found lead:', existingLead ? 'Yes' : 'No');

			if (!existingLead) {
				console.log(`No lead found for id_user: ${id_user} and flow_2token: ${flow_2token}`);
				continue;
			}

			// Update the matching flow directly using the positional $ operator
			const result = await Leads.updateOne(
				{ 
					id_user: id_user,
					'flows.flow_2token': flow_2token 
				},
				{ $set: updateData }
			);

			console.log('Update result:', result);
		}

		await adminWhatsAppNotification(userPhone, `✅ Excel procesado exitosamente. Se actualizaron los leads correspondientes.`);

	} catch (error) {
		console.error("Error completo:", error);
		await adminWhatsAppNotification(userPhone, `*NOTIFICACION de Error procesando Excel para el cambio de Status en Leads:*\n${error.message}`);
	}
};