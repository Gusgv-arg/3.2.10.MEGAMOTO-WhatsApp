import mongoose from "mongoose";

const flowDetailSchema = new mongoose.Schema({
	flowName: String,
	flowDate: String,
	client_status: { type: String, enum: ["contactado", "respuesta", "falta DNI", "falta modelo", "faltan modelo y DNI", "error","transferido al vendedor", "vendedor", "vendedor más tarde", "vendedor derivado", "compró", "sin definición", "no compró"] },
	brand: {type: String, enum : ["Benelli", "Suzuki", "Sym", "Motomel", "Keeway", "Tarpan", "Teknial eléctricas", "TVS", "No sé"]},
	model: String,
	payment: {type: String, enum: ["contado", "tarjeta", "préstamo"]},
	dni: Number,
	messages: String,
	vendor_name: String,
	vendor_phone: Number,
	history: String,
	flow_token: String,
	flow_status: { type: String, enum: ["activo", "inactivo"] },
	error: String,
});

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
			"failed",
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
		flows: [flowDetailSchema],
	},
	{
		timestamps: true,
	}
);

const Leads = mongoose.model("Leads", leadsSchema);
export default Leads;
