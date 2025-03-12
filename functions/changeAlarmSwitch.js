import BotSwitch from "../models/botSwitch.js";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";

const myPhone = process.env.MY_PHONE;

export const changeAlarmSwitch = async () => {
	let alarm;
    try {
		let botSwitch = await BotSwitch.findOne();

		if (botSwitch.alarmSwitch === "ON") {
			// Change Alarm Switch
			botSwitch.alarmSwitch = "OFF";
            alarm = "OFF"
			await botSwitch.save();
		} else if (botSwitch.alarmSwitch === "OFF") {
            // Change Alarm Switch
			botSwitch.alarmSwitch = "ON";
            alarm = "ON"
			await botSwitch.save();
		}
		return alarm;
	
    } catch (error) {
		console.log("Error in changeAlarmSwitch", error.message);
		await adminWhatsAppNotification(myPhone, error.message);
	}
};
