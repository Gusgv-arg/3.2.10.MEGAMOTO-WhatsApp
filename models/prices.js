import mongoose from "mongoose";

const pricesSchema = new mongoose.Schema(
	{
		modelo: { type: String, required: true },
		familia: { type: String, required: true },
		marca: { type: String, required: true },
		precio: { type: Number, required: true },
		prioridad: Number,
		sinonimos: {
			type: [String],
			default: [""]
		  },
		cilindradas: { type: Number, required: true, default: 0 },	
		url: {type: String, default: "n/d"},	
		vigencia: {type: String, required: true},
		isActive: {type: Boolean, required: true, default: true}		
	},
	{
		timestamps: true,
	}
);

const Prices = mongoose.model("Prices", pricesSchema);
export default Prices;