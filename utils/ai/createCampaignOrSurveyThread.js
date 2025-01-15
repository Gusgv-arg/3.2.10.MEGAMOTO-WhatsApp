import OpenAI from "openai";
import dotenv from "dotenv";

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const createCampaignOrSurveyThread = async (personalizedMessage) => {
	try {
		// Create a new thread with the initial messages
		const thread = await openai.beta.threads.create({
			messages: [
				{
					role: "user",
					content: "Hola",
				},
				{
					role: "assistant",
					content: personalizedMessage,
				},
			],
		});
		const threadId = thread.id;
		
		return threadId;
	} catch (error) {
		console.log("Error en createCampaignOrSurveyThread:", error.message);
		throw error;
	}
};
