import Leads from "../models/leads.js";
import { greeting } from "../utils/greeting.js";
import { createGptThread } from "../utils/createGptThread.js";
import { handleWhatsappGreeting } from "../utils/handleWhatsappGreeting.js";
import { handleWhatsAppMaxResponses } from "../utils/handleWhatsAppMaxResponses.js";
import { newLeadWhatsAppNotification } from "../utils/newLeadWhatsAppNotification.js";

const maxResponses = process.env.MAX_RESPONSES;
const myPhone = process.env.MY_PHONE
const myPhone2 = process.env.MY_PHONE2

// Middleware that creates the user in DB if it doesn't exist || next()
export const userWhatsAppMiddleware = async (req, res, next) => {
	const body = req.body;
	//console.log("Lo que recibo de la API de Whatsapp -->", body);
	let channel = body.entry[0].changes ? "WhatsApp" : "Other";
	//console.log("Channel:", channel);
	
	if (channel === "WhatsApp" && body?.entry[0]) {
		let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages[0]
			?.type
			? body.entry[0].changes[0].value.messages[0].type
			: "other type";
		console.log("Type of WhatsApp message:", typeOfWhatsappMessage);

		// Pass type to req object
		req.type = typeOfWhatsappMessage;

		const userPhone = body.entry[0].changes[0].value.messages[0].from;
		const name = body.entry[0].changes[0].value.contacts[0].profile.name;
		console.log("User name----->", name);
		console.log("User phone---->", userPhone);

		let message;

		if (typeOfWhatsappMessage === "text") {
			message = body.entry[0].changes[0].value.messages[0].text.body;
			console.log("User message-->", message);
		} else if (typeOfWhatsappMessage === "audio") {
			message = "Audio message";
			console.log("User message-->", message);
		} else if (typeOfWhatsappMessage === "image") {
			message = "Image Message";
			console.log("User message-->", message);
		} else {
			message = "Message with another format than audio, text or image";
			console.log("User message-->", message);
		}

		// Find the lead by id_user / phone number
		let lead = await Leads.findOne({ id_user: userPhone });

		// If the lead does not exist for that phone, create it && save message && greet the user
		if (lead === null) {
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

			lead = await Leads.create({
				name: name ? name : "WhatsApp User",
				id_user: userPhone,
				content: `${currentDateTime} - ${name}: ${message}\n${currentDateTime} - MegaBot: ¡Hola ${name}${greeting}`,
				botSwitch: "ON",
				channel: channel,
				responses: 1,
			});
			console.log("Lead created in Leads DB");

			// Post greeting to the new customer
			await handleWhatsappGreeting(name, userPhone);

			// Create a Thread sending user message and greeting to GPT
			const thread = await createGptThread(name, message);
			console.log("thread_id", thread)

			// Save thread in DB
			lead.thread_id = thread;
			await lead.save();
			console.log("Lead updated with threadId");

			// Send Notification of new lead to Admin
			newLeadWhatsAppNotification(channel, name)

			res.status(200).send("EVENT_RECEIVED");
		
		//Block user from doing more requests
		} else if (lead.responses + 1 > maxResponses && userPhone !== myPhone && userPhone !== myPhone2) {
			console.log("User reached max allowed responses");
			await handleWhatsAppMaxResponses(name, userPhone);
			res.status(200).send("EVENT_RECEIVED");
			return;
		
		} else {
			next();
		}
	} else {
		console.log(
			"Object received from WhatsApp API not processed by this API:",
			body
		);
		res.status(200).send("EVENT_RECEIVED");
	}
};
