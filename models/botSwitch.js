import mongoose from "mongoose";

const botSwitchSchema = new mongoose.Schema(
	{
		generalSwitch: { type: String, enum: ['ON', 'OFF'], required: true },
		alarmSwitch1: { type: String, enum: ['ON', 'OFF'] },
		alarmSwitch2: { type: String, enum: ['ON', 'OFF'] },
	},
	{
		timestamps: true,
	}
);

const BotSwitch = mongoose.model(
	"BotSwitch",
	botSwitchSchema
);

export default BotSwitch;