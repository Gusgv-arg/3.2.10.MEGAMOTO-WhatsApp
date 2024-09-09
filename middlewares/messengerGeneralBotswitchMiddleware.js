import axios from "axios";
import BotSwitch from "../models/botSwitch.js";
import dotenv from "dotenv";
import { userWhatsAppNotification } from "../utils/userWhatsAppNotification.js";
import { handleMessengerMessage } from "../utils/handleMessengerMessage.js";
import { errorMessage1 } from "../utils/errorMessages.js";

dotenv.config();

const myPhone = process.env.MY_PHONE;

export const messengerGeneralBotSwitchMiddleware = async (req, res, next) => {
	const body = req.body;
    const senderId = body?.entry[0]?.messaging[0].sender.id ? body.entry[0].messaging[0].sender.id : "";
    
	try {
		let botSwitchInstance = await BotSwitch.findOne();
		// Next() if general switch is ON or message is not from Admin
		if (botSwitchInstance.generalSwitch === "ON" ) {
			next();
		
        // General Bot Switch is off
		} else {
			console.log(
				"Exiting the process, General Bot Switch is turned OFF. MegaBot is stopped!"
			);
			
            // Notify user that MegaBot is off
            await handleMessengerMessage(senderId, errorMessage1)

			res.status(200).send("EVENT_RECEIVED")
		}
	} catch (error) { 
		console.log(
			"An error ocurred in MessengerGeneralBotSwitchMiddleware.js when looking general switch"
		);
		throw error;
	}
};
