import { handleTestMessage } from "../utils/handleTestMessage.js";
import { processMessageWithAssistant } from "../utils/processMessageWithAssistant.js";

export const testingController = (req, res) => {
	const body = req.body;
	console.log("Lo que recibo de la API de facebook", body);
	console.log(
		"Mensaje del usuario ---->",
		body.entry[0].messaging[0].message.text
	);

	// Check if its Messenger App
	if (body.object === "page") {
		const channel = "Messenger";
		//Verificar que facebook me manda un array con mas de 1 registro
		body.entry.forEach(async (entry) => {
			// Gets body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log("entry.messaging[0].sender:", entry.messaging[0].sender);
			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;

			if (webhook_event.message) {
				//Handle the message sent by the user
				const userMessage = webhook_event.message.text;

				console.log("sender_psid", sender_psid);
				// Process the message with the assistant
				const response = await processMessageWithAssistant(
					sender_psid,
					userMessage,
					channel
				);
				console.log("Mensaje recibido de openai:", response);

				// Send the response back to the user
				handleTestMessage(
					response.sender_psid,
					response.messageGpt,
					response.threadId
				);
				// Returns a '200 OK' and the GPT message
				res.status(200).send(response.messageGpt);
			}
		});
	} else {
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
};
