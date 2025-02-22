import mongoose from "mongoose";

const flowDetailSchema = new mongoose.Schema({
	flowName: String,
	flowDate: String,
	client_status: { type: String, enum: ["primer contacto","enviado", "leído","falló envío", "esperando", "falta DNI", "falta modelo", "faltan modelo y DNI", "error","transferido al vendedor", "vendedor", "a contactar", "vendedor derivado", "compró", "sin definición", "no compró"] },
	toContact: Date,
	origin: {enum :["API General", "Salón", "Referido"]},
	brand: {type: String, enum : ["Benelli", "Suzuki", "Sym", "Motomel", "Keeway", "Tarpan", "Teknial eléctricas", "Teknial", "TVS", "No sé"]},
	model: String,
	price: Number,
	payment: String,
	otherProducts: String,
	dni: Number,
	credit: String,
	questions: String,
	messages: String,
	vendor_name: {type: String, enum:["Gustavo_GV", "Gustavo_Glunz", "Joana", "Ernesto", "Joselin", "Darío", "José"]},
	vendor_phone: Number,
	vendor_notes: String,
	history: String,
	flow_2token: String,
	flow_status: { type: String, enum: ["activo", "inactivo"] },
	wamId_flow1: String,
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
