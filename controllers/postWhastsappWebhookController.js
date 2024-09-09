import axios from "axios";
import { MessageQueue } from "../utils/messageQueue.js";

// Define a new instance of MessageQueue
const messageQueue = new MessageQueue();

export const postWhatsappWebhookController = async (req, res) => {
	const body = req.body;
	const type = req.type;
	console.log("Messages-->", body.entry[0].changes[0].value.messages[0]);

	let audioId;
	let imageId;
	let documentId;
	if (type === "audio") {
		audioId = body.entry[0].changes[0].value.messages[0].audio
			? body.entry[0].changes[0].value.messages[0].audio.id
			: "otro formato";
		console.log("Audio ID:", audioId);
	} else if (type === "image") {
		imageId = body.entry[0].changes[0].value.messages[0].image
			? body.entry[0].changes[0].value.messages[0].image.id
			: "otro formato";
	} else if (type === "document") {
		documentId = body.entry[0].changes[0].value.messages[0].document
			? body.entry[0].changes[0].value.messages[0].document.id
			: "otro formato";
	}
	//console.log("Lo que recibo x WhatsApp de la API de facebook -->", body);
	//console.log("Changes-->", body.entry[0].changes[0])
	//console.log("Contacts-->", body.entry[0].changes[0].value.contacts)

	if (body.entry[0]) {
		if (
			body.entry &&
			body.entry[0].changes &&
			body.entry[0].changes[0].value.messages &&
			body.entry[0].changes[0].value.messages[0]
		) {
			const message =
				type === "audio"
					? "Audio message"
					: type === "image"
					? body.entry[0].changes[0].value.messages[0].image.caption
					: type === "text"
					? body.entry[0].changes[0].value.messages[0].text.body
					: type === "document"
					? body.entry[0].changes[0].value.messages[0].document.caption
					: type === "button"
					? body.entry[0].changes[0].value.messages[0].button.text
					: "unknown message";
			const userPhone = body.entry[0].changes[0].value.messages[0].from;
			const channel = "whatsapp";
			const name = body.entry[0].changes[0].value.contacts[0].profile.name;
			//console.log("User message-->", message);
			//console.log("User message phone-->", userPhone);

			// Get the message sent by the user & create an object to send it to the queue
			const userMessage = {
				channel: channel,
				message: message,
				name: name,
				type: type,
				audioId: audioId ? audioId : "",
				imageId: imageId ? imageId : "",
				documentId: documentId ? documentId : "",
			};

			messageQueue.enqueueMessage(userMessage, userPhone);

			// Returns a '200 OK' response to all requests
			res.status(200).send("EVENT_RECEIVED");
		}
	} else {
		console.log("Object send by WhatsApp not processed by this API", body);
		res.status(400).send("Not processed by this API");
	}
};
