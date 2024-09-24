import OpenAI from "openai";
import dotenv from "dotenv";

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const addMessagesToThread = async (campaignThreadId, message, predefinedMessage)=>{

try {
    await openai.beta.threads.messages.create(campaignThreadId, 
            {
                role: "user",
                content: message,
            },
            {
                role: "assistant",
                content: predefinedMessage,
            },       
    );    
    
} catch (error) {
    console.log("Error in addMessagesToThread.js", error.message)
    throw error
}
}