import Leads from "../../models/leads.js";
import {extractFlowResponses} from "../../flows/extractFlowResponses.js"

export const processWhatsAppFlowWithApi = async (
	senderId,
	userMessage,
	type
) => {
	
	let existingLead;
	try {
		
        if (type === "interactive") {
			flowFlag = true;
			// Function that identifies Flow with the TOKEN and extracts information
			const responses = extractFlowResponses(userMessage, userName);
			const { finalNotification, flowToken } = responses;
			const notification = finalNotification;
			
			return { notification, threadId, campaignFlag, flowFlag, flowToken };
		}
    
    
    
    } catch (error) {
		console.error("Error fetching thread from the database:", error);
		throw error.message;
	}
}
