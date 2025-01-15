import { saveMessageInDb } from "../dataBase/saveMessageInDb.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import { processWhatsAppFlowWithApi } from "../whatsapp/processWhatsAppFlowWithApi.js";

const myPhone = process.env.MY_PHONE;

// Class definition for the Queue
export class WhatsAppFlowMessageQueue {
	constructor() {
		this.queues = new Map();
	}

	// Function to process the Queue
	async processQueue(senderId) {
		const queue = this.queues.get(senderId);
		//console.log("Queue:", queue);

		//If there is no queue or there is no processing return
		if (!queue || queue.processing) return;

		// Turn processing to true
		queue.processing = true;

		while (queue.messages.length > 0) {
			// Take the first record and delete it from the queue
			let newMessage = queue.messages.shift();
			let imageURL;
			let documentURL;

			try {

				// Process the message
				const response = await processWhatsAppFlowWithApi(
					senderId,
					newMessage.message,
					imageURL,
					newMessage.type
				);
                
					

					
				
			} catch (error) {
				console.error(`14. Error in messageQueue.js: ${error.message}`);
				// Send error message to the user
				const errorMessage = errorMessage1;

				// Change flag to allow next message processing
				queue.processing = false;

				// Error handlers
				if (newMessage.channel === "whatsapp") {
					// Send error message to customer
					//handleWhatsappMessage(senderId, errorMessage);

					// Send WhatsApp error message to Admin
					const errorMessage = `*NOTIFICACION DE ERROR:*\n${error.message}`;
					await adminWhatsAppNotification(myPhone, errorMessage);
				}
			}
		}
		// Change flag to allow next message processing
		queue.processing = false;
	}

	// Function to add messages to the Queue
	enqueueMessage(userMessage, senderId, responseCallback = null) {
		// If the queue has no ID it saves it && creates messages, processing and resposeCallbach properties
		if (!this.queues.has(senderId)) {
			this.queues.set(senderId, {
				messages: [],
				processing: false,
				responseCallback: null,
			});
		}

		// Look for the queue with the sender ID
		const queue = this.queues.get(senderId);
		//console.log("Queue:", queue);

		// Add the message to the Queue
		queue.messages.push(userMessage);

		// Process the queue
		this.processQueue(senderId);
	}
}
