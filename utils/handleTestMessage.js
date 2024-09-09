import axios from "axios";
import { saveMessageInDb } from "./saveMessageInDb.js";


// Función que recibe la respuesta del GPT, guarda en BD y envía al usuario la respuesta
export const handleTestMessage = async (sender_psid, messageGpt, thread_id) => {
	try {
		const name = "MegaBot";
		//const role = "assistant";
		const channel = "facebook";

		// Save the sent message in the database
		await saveMessageInDb(sender_psid, messageGpt, thread_id, name, channel);

		return
	} catch (error) {
		console.log("Error en handleMessage", error.message);
		throw error;
	}
};
