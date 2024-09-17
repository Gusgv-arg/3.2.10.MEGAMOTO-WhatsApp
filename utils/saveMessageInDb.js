import Leads from "../models/leads.js";
import { logError } from "./logError.js";

export const saveMessageInDb = async (
	senderId,
	messageGpt,
	threadId,
	newMessage,
	campaignFlag
) => {
	// Save the sent message to the database
	try {
		// Find the lead by threadId
		let lead = await Leads.findOne({ id_user: senderId });

		// If the lead does not exist for that thread, there is an error and returns.
		if (lead === null) {
			console.log("¡¡ERROR: Lead not found in DB!!");
			return;
		} else {
			// Obtain current date and hour
			const currentDateTime = new Date().toLocaleString("es-AR", {
				timeZone: "America/Argentina/Buenos_Aires",
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});

			let newContent;

			// Determine wether it's a general thread or campaign
			if (campaignFlag === false) {
				// Concatenate in the general thread the new messages from user && GPT to the existing content
				newContent = `${lead.content}\n${currentDateTime} - ${newMessage.name}: ${newMessage.message}\nMegaBot: ${messageGpt}`;

				// Update the lead content in the general thread
				lead.content = newContent;
				lead.channel = newMessage.channel;
				lead.thread_id = threadId;
				lead.responses = lead.responses + 1;

				// Save the updated lead
				await lead.save();
				console.log("Lead updated with GPT message in Leads DB");
				return;
			} else if (campaignFlag === true) {
				// Look for Campaign in the array of Campaigns
				const currentCampaign = lead.campaigns.find(
					(campaign) => campaign.campaignThreadId === threadId
				);

				if (!currentCampaign) {
					console.log("Campaign not found for this thread");
					return;
				}

				// Concatenate the campaign message with the previous ones
				const newMessageContent = `\n${currentDateTime} - ${newMessage.name}: ${newMessage.message}\nMegaBot: ${messageGpt}`;

				// Replace the messages history with the new one  
				currentCampaign.messages = currentCampaign.messages
					? currentCampaign.messages + newMessageContent
					: newMessageContent;

				// Update Campaign status
				currentCampaign.client_status = "respuesta";

				// Clean error if it existed
				if (currentCampaign.error) {
					currentCampaign.error = null;
				}

				// Update lead
				await lead.save();
				console.log("Lead updated with campaign message in Leads DB");
				return;
				
			} else {
				console.log("there is no campaign flag so nothing was stored in DB!!");
				return;
			}
		}
	} catch (error) {
		logError(error, "An error occured while saving message in Messages DB");
		throw new Error(error.message);
	}
};
