import OpenAI from "openai";

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

// Function that creates a general thread when the lead does not exist in DB (prevents error if Campaign is inactive) 
export const createGeneralThread = async () => {
	try {
		// Create a new thread
		const thread = await openai.beta.threads.create();
		const threadId = thread.id;		
		return threadId;

	} catch (error) {
		console.log("Error en createGeneralThread.js:", error.message);
		throw error;
	}
};