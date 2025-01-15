import fs from 'fs';
import OpenAI from "openai";
import { errorMessage1, errorMessage2, errorMessage3 } from "./errorMessages.js";

// ------------ ACORDARME DE PASAR A .ENV LA API KEY Y EL ASSISTANT ID!!!! -------------
// ------------ ACORDARME DE PASAR A .ENV LA API KEY Y EL ASSISTANT ID!!!! -------------
const API_KEY = process.env.API_KEY_MIA_X_USO_PRESTADO_GPT;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const marketAnalisisWithAssistant = async (txtData) => {
	try {
		// Create the thread
		const thread = await openai.beta.threads.create();
		const threadId = thread.id;

		// Message to be sent to the Assistant
		const message = txtData;

		// Attach the message to the thread
		await openai.beta.threads.messages.create(threadId, {
			role: "user",
			content: message,
		});

		// Run the assistant and wait for completion
		let maxAttempts = 5;
		let currentAttempt = 0;
		let runStatus;
		let run;
		let errorMessage;
		do {
			try {
                const assistant = "asst_UuTF2wTp2pKtD3QbnG65WQo2"
				run = await openai.beta.threads.runs.create(threadId, {
					assistant_id: assistant,
				});

				runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

				while (runStatus.status !== "completed") {
					console.log("run status---->", runStatus.status);
					console.log("run last_error---->", runStatus.last_error);

					if (runStatus.status === "failed") {
						currentAttempt++;
						const runMessages = await openai.beta.threads.messages.list(
							threadId
						);
						if (
							runMessages.body.data[0].assistant_id === null ||
							runStatus.last_error !== null
						) {
							// Error if rate limit is exceeded
							if (runStatus.last_error === "rate_limit_exceeded") {
								errorMessage = errorMessage3;
							} else {
								errorMessage = errorMessage2;
							}

							// Clean threadId for the user due to Openai bug
							await cleanThread(senderId);

							// Return error message to the user
							return { errorMessage, senderId, campaignFlag };
						} else {
							errorMessage = errorMessage1;
						}
					} else {
						console.log("Run is not completed yet.");
					}
					await new Promise((resolve) => setTimeout(resolve, 2000));
					runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
				}

				console.log(
					"Run status is completed. Proceeding with sending the message to the user."
				);

				break; // Exit the loop if the run is completed
			} catch (error) {
				console.error("Error running the assistant:", error.message);
				currentAttempt++;
				if (currentAttempt >= maxAttempts) {
					console.error("Exceeded maximum attempts. Exiting the loop.");
					errorMessage = errorMessage1;

					return { errorMessage };
				}
			}
		} while (currentAttempt < maxAttempts);

		// Get the last assistant message from the messages array
		const messages = await openai.beta.threads.messages.list(threadId);

		// Find the last message for the current run
		const lastMessageForRun = messages.data
			.filter(
				(message) => message.run_id === run.id && message.role === "assistant"
			)
			.pop();

		// Save the received message from the user and send the assistants response
		if (lastMessageForRun) {
			let messageGpt = lastMessageForRun.content[0].text.value;
			return { messageGpt };
		}
	} catch (error) {
		console.log("error in marketAnalisisWithAssistant:", error.message);
	}
};

// Leer el archivo de texto y ejecutar la función con su contenido
/* fs.readFile('../excel/products.txt', 'utf8', async (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
        return;
    }
    await marketAnalisisWithAssistant(data); // Ejecutar la función con el contenido del archivo
}); */
//marketAnalisisWithAssistant(allProducts)