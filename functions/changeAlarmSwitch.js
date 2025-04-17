import BotSwitch from "../models/botSwitch.js";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";

const myPhone = process.env.MY_PHONE;
const myPhone2 = process.env.MY_PHONE2;

// Función que prende o apaga alarma de nuevos leads
export const changeAlarmSwitch = async (userPhone) => {
    try {
        let alarm;
		let botSwitch = await BotSwitch.findOne();

		if (userPhone === myPhone){
			if (botSwitch.alarmSwitch1 === "ON") {
				// Change Alarm Switch
				botSwitch.alarmSwitch1 = "OFF";
				await botSwitch.save();
				alarm = "OFF"
				return alarm;
			} else if (botSwitch.alarmSwitch1 === "OFF") {
				// Change Alarm Switch
				botSwitch.alarmSwitch1 = "ON";
				await botSwitch.save();
				alarm = "ON"
				return alarm;
			}

		} else if (userPhone === myPhone2){
			if (botSwitch.alarmSwitch2 === "ON") {
				// Change Alarm Switch
				botSwitch.alarmSwitch2 = "OFF";
				await botSwitch.save();
				alarm = "OFF"
				return alarm;
			} else if (botSwitch.alarmSwitch2 === "OFF") {
				// Change Alarm Switch
				botSwitch.alarmSwitch2 = "ON";
				await botSwitch.save();
				alarm = "ON"
				return alarm;
			}		
		}
	
    } catch (error) {
		console.log("Error in changeAlarmSwitch", error.message);
		await adminWhatsAppNotification(myPhone, error.message);
	}
};
