import OpenAI from "openai";

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const createCampaignThread = async (personalizedMessage) => {
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
				content: personalizedMessage,
			}
		);
		return threadId;
	} catch (error) {
		console.log("Error en createCampaignThread:", error.message);
		throw error;
	}
};
