import mongoose from "mongoose";

const campaignDetailSchema = new mongoose.Schema({
	campaignName: String,
	campaignDate: Date,
	campaignThreadId: String,
	messages: String,
	wamId: String,
	client_status: {
		type: String,
		enum: [
			"a enviar",
			"aceptado",
			"rejected",
			"enviado",
			"entregado",			
			"leído",
			"respuesta_cliente",
			"vendedor",
			"dni",
			"no interesado",
			"vendedor no notificado",
			"error"
		],
	},
	payment: { type: String, enum: ["sin información", "contado", "tarjeta", "préstamo"] },
	campaign_status: { type: String, enum: ["activa", "inactiva"] },
	vendor_phone: String,
	error: String,
});

const leadsSchema = new mongoose.Schema(
	{
		name: { type: String },
		id_user: { type: String, required: true },
		channel: { type: String },
		content: { type: String },
		thread_id: { type: String },
		botSwitch: { type: String, enum: ["ON", "OFF"], required: true },
		responses: { type: Number },
		campaigns: [campaignDetailSchema],
	},
	{
		timestamps: true,
	}
);

const Leads = mongoose.model("Leads", leadsSchema);
export default Leads;
