import dotenv from "dotenv";
import axios from "axios";
import { messengerGreeting } from "./greeting.js"; 

dotenv.config();

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

// Function that sends Messenger greeting
export const handleMessengerGreeting = async(senderId)=>{
    try {
		
		// Posts the message to Facebook
		const url = `https://graph.facebook.com/v20.0/${FACEBOOK_PAGE_ID}/messages?access_token=${PAGE_ACCESS_TOKEN}`;
		const data = {
			recipient: {
				id: senderId,
			},
			messaging_type: "RESPONSE",
			message: {
				text: messengerGreeting,
			},
		};

		const response = await axios
			.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			.then((response) => {
				console.log("Response from Facebook:", response.data);
			})
			.catch((error) => {
				console.error(
					"Error enviando a Facebook------------>",
					error.response ? error.response.data : error.message
				);
			});
	} catch (error) {
		console.log("Error en handleMessengerGreeting", error.message);
		throw error;
	}


}