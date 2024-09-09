import Leads from "../models/leads.js"
import { createGptThread } from "./createGptThread.js";

// Function that creates a new thread && saves it in DB
export const cleanThread = async (senderId) => {
	
    try {
		let lead = await Leads.findOne({ id_user: senderId });
		if (lead) {
			const name = "estimado cliente"
            const message = "Hola"
            const newThread = await createGptThread(name, message)
            console.log("New Thread en cleanThread:", newThread)
            lead.thread_id = newThread;
			await lead.save();
            return
		} else {
            console.log(`El Thread del usuario con ID ${senderId} NO pudo ser reseteado`)
            return
        }
	} catch (error) {
        console.log("Error in cleanThreadController.js:", error.message)
        throw error
    }
};