import { newErrorWhatsAppNotification } from "../utils/newErrorWhatsAppNotification.js";
import BotSwitch from "../models/botSwitch.js";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

export const changeMegaBotSwitch = async (instruction) => {
	try {
		let botSwitch = await BotSwitch.findOne();

		if (instruction === "ON") {
			// Change General Switch
			botSwitch.generalSwitch = "ON";
			await botSwitch.save();			
		
		} else if (instruction === "OFF") {
			// Change General Switch
			botSwitch.generalSwitch = "OFF";
			await botSwitch.save();		
			
		} else {
			return;
		}
        return
	} catch (error) {
		console.log("Error in megaBotSwitch", error.message);
		newErrorWhatsAppNotification("whatsapp", error.message);
		throw error;
	}
};
