import { newErrorWhatsAppNotification } from "../utils/notifications/newErrorWhatsAppNotification.js";
import BotSwitch from "../models/botSwitch.js";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";

const myPhone = process.env.MY_PHONE;

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
		return;
	} catch (error) {
		console.log("Error in megaBotSwitch", error.message);
		await adminWhatsAppNotification(myPhone, error.message);
	}
};
