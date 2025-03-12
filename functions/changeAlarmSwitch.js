import BotSwitch from "../models/botSwitch.js";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";

const myPhone = process.env.MY_PHONE;

export const changeAlarmSwitch = async () => {
    try {
        let alarm;
		let botSwitch = await BotSwitch.findOne();
        console.log("botSwitch:", botSwitch)
        console.log("botSwitch.alarmSwitch:", botSwitch.alarmSwitch)
		if (botSwitch.alarmSwitch === "ON") {
			// Change Alarm Switch
			botSwitch.alarmSwitch = "OFF";
			await botSwitch.save();
            alarm = "OFF"
            console.log("alarm en changeAlarmSwitch:", alarm)
            return alarm;
		} else if (botSwitch.alarmSwitch === "OFF") {
            // Change Alarm Switch
			botSwitch.alarmSwitch = "ON";
			await botSwitch.save();
            alarm = "ON"
            console.log("alarm en changeAlarmSwitch:", alarm)
            return alarm;
		}
	
    } catch (error) {
		console.log("Error in changeAlarmSwitch", error.message);
		await adminWhatsAppNotification(myPhone, error.message);
	}
};
