import mongoose from "mongoose";
import Leads from "../models/leads.js"

const keepLastCampaign = async () => {
	const leads = await Leads.find(); // Obtener todos los registros de Leads
    console.log(leads)
	for (const lead of leads) {
		if (lead.campaigns.length > 0) {
			lead.campaigns = [lead.campaigns[lead.campaigns.length - 1]]; // Mantener solo el último registro
			await lead.save(); // Guardar los cambios
		}
	}
};

const run = async () => {
	try {
		await mongoose.connect("mongodb+srv://megamoto:ZkHz5kipo6cy7FK4@cluster0.zcwwa.mongodb.net/Megamoto?retryWrites=true&w=majority"); // Conectar a la base de datos
		await keepLastCampaign(); // Llamar a la función
		console.log("Actualización completada.");
	} catch (error) {
		console.error("Error:", error);
	} finally {
		mongoose.connection.close(); // Cerrar la conexión
	}
};

run();
