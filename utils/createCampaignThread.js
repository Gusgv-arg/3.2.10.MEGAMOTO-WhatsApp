import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const createCampaignThread = async (campaignName, name) => {
	try {

		// Create a new thread
		const thread = await openai.beta.threads.create();
		const threadId = thread.id;

		// Pass in the user question && the greeting into the new thread
		await openai.beta.threads.messages.create(
			threadId,
			{
				role: "user",
				content: "Hola",
			},
			{
				role: "assistant",
				content: `¡Hola ${name}! Te contactamos de Megamoto por la Campaña ${campaignName}.`,
			}
		);
		return threadId;
	} catch (error) {
		console.log("Error en createCampaignThread:", error.message);
		throw error;
	}
};
