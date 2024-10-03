import axios from "axios";
import xlsx from "xlsx";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";
import Leads from "../models/leads.js";
import { createCampaignThread } from "../utils/createCampaignThread.js";
import { searchTemplate } from "../utils/searchTemplate.js";
import { createGeneralThread } from "../utils/createGeneralThread.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function for a specific Excel Format for Pedidos Ya Campaign for Megamoto
export const processPedidoYa = async (
	excelBuffer,
	templateName,
	campaignName,
	userPhone
) => {
	try {
		// Look for the template text body
		const templateText = await searchTemplate(templateName, userPhone);
		//console.log("Texto de la Plantilla:", templateText);

		// Extract variables from template text
		const templateVariables = templateText.match(/{{\d+}}/g) || [];
		const templateVariableCount = templateVariables.length;

		// Process Excel file
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet);

		// Get headers dynamically
		const headers = Object.keys(data[0]);
		const excelVariableCount = headers.length - 2; // Exclude client number && vendor phones columns

		// Check if the number of variables match
		if (templateVariableCount !== excelVariableCount) {
			throw new Error(
				`La plantilla de WhatsApp tiene ${templateVariableCount} variables y el Excel tiene ${excelVariableCount} columnas. El Excel debe tener teléfono del cliente en columna A, el nombre en columna B, modelo de moto en la C y teléfono del vendedor en la D.`
			);
		}

		// URL where to post Campaign
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

		// Variables to track Campaign
		let successCount = 0;
		let errorCount = 0;
		let newLeadsCount = 0;
		let campaignThread = "";

		// Loop for each record
		for (const row of data) {
			// Ensure the row has a phone number in the first column
			let messageSentToCustomer = false;
			const telefono = row[headers[0]];
			if (!telefono) {
				console.error(
					`Fila inválida (sin número de teléfono): ${JSON.stringify(row)}`
				);
				errorCount++;
				continue;
			}

			// Función para escapar caracteres especiales en expresiones regulares
			function escapeRegExp(string) {
				return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			}

			// Create personalized message by replacing variables in templateText
			let personalizedMessage = templateText;
			headers.slice(1).forEach((header, index) => {
				const variableNumber = index + 1; // {{1}} corresponde a la segunda columna (index 0 + 1)
				const variableRegex = new RegExp(
					escapeRegExp(`{{${variableNumber}}}`),
					"g"
				);
				const value =
					row[header] !== undefined ? row[header].toString().trim() : "";

				const beforeReplace = personalizedMessage;
				personalizedMessage = personalizedMessage.replace(variableRegex, value);
			});
			//console.log("Mensaje individual:", personalizedMessage);

			// From the array of headers, take off the client && vendor telephones and map the records that correspond to the variables of the Campaign Template
			const parameters = headers.slice(1, 3).map((header) => ({
				type: "text",
				text: row[header] ? row[header].toString() : "",
			}));

			const messageData = {
				messaging_product: "whatsapp",
				to: telefono.toString(),
				type: "template",
				template: {
					name: templateName,
					language: {
						code: "es_AR",
					},
					components: [
						{
							type: "header",
							parameters: [
								{
									type: "image",
									image: {
										link: "https://github.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/blob/main/assets/foto_campa%C3%B1a_pedidosya.jpg?raw=true",
									},
								},
							],
						},
						{
							type: "body",
							parameters: parameters,
						},
					],
				},
			};

			try {
				// Looks existent lead or creates a new one
				let lead = await Leads.findOne({ id_user: telefono.toString() });

				if (!lead) {
					// Create a thread for the Campaign with the initial messages
					campaignThread = await createCampaignThread(personalizedMessage);
					//console.log("campaignthreadID-->", campaignThread);

					// Prepare a Campaign detail object
					let campaignDetail = {
						campaignName: campaignName,
						campaignDate: new Date(),
						campaignThreadId: campaignThread,
						messages: `MegaBot: ${personalizedMessage}`,
						wab_id: "",
						client_status: "a enviar",
						campaign_status: "activa",
						payment: "sin información",
						vendor_phone: row[headers[3]] || "", // Guardar el teléfono del vendedor en la columna D,
						error: "",
					};

					// Create a General Thread (just in case the campaign is stopped)
					const generalThread = await createGeneralThread();

					// Creates a new lead if it does not exist
					lead = new Leads({
						name: row[headers[1]] || "", // Asumiendo que el nombre está en la segunda columna
						id_user: telefono.toString(),
						channel: "WhatsApp",
						content: "",
						thread_id: generalThread,
						botSwitch: "ON",
						responses: 0,
						campaigns: [campaignDetail],
					});
					await lead.save();
					newLeadsCount++;

					// Post the Campaign to the customer
					const response = await axios.post(url, messageData, {
						headers: { "Content-Type": "application/json" },
					});

					if (response.data) {
						messageSentToCustomer = true;
						console.log(
							`Mensaje enviado a ${lead.name} - ${telefono}: ${personalizedMessage}`
						);
						console.log("Response.data", response.data)

						//Save whatsApp Id to track message status
						const whatsAppMessageId = response.data.messages[0].id
						const whatsAppMessageStatus = response.data.messages[0].message_status === "accepted" ? "aceptado" : response.data.messages[0].message_status 
						campaignDetail.wab_id=whatsAppMessageId
						campaignDetail.client_status=whatsAppMessageStatus
						await lead.save();
					}

					// Increment counter
					successCount++;
			
			// Lead already exists!!
			} else {
					// Check if the campaign name is different
					const existingCampaign = lead.campaigns.find(
						(c) => c.campaignName === campaignName
					);

					if (!existingCampaign) {
						// Create a thread for the Campaign with the initial messages
						campaignThread = await createCampaignThread(personalizedMessage);
						//console.log("campaignthreadID-->", campaignThread);

						// Prepare a Campaign detail object
						const campaignDetail = {
							campaignName: campaignName,
							campaignDate: new Date(),
							campaignThreadId: campaignThread,
							messages: `MegaBot: ${personalizedMessage}`,
							client_status: "contactado",
							campaign_status: "activa",
							payment: "sin información",
							vendor_phone: row[headers[3]] || "", // Guardar el valor de la columna D,
							error: "",
						};

						// Update existing lead with new campaign
						lead.campaigns.push(campaignDetail);
						await lead.save();

						// Send the message
						const response = await axios.post(url, messageData, {
							headers: { "Content-Type": "application/json" },
						});
						console.log(
							`Mensaje enviado a ${lead.name} - ${telefono}: ${personalizedMessage}`
						);
						successCount++;
					} else {
						console.warn(
							`El cliente ${lead.name} - ${telefono} ya ha sido contactado en la campaña ${campaignName}.`
						);
					}
				}
			} catch (error) {
				console.error(
					`Error enviando mensaje a ${telefono}:`,
					error.response?.data || error.message
				);
				errorCount++;

				// Handle the Error
				const campaignDetail = {
					campaignName: campaignName,
					campaignDate: new Date(),
					campaignThreadId: campaignThread,
					messages: messageSentToCustomer
						? `MegaBot: ${personalizedMessage}`
						: `Error al contactar cliente por la Campaña ${campaignName}.`,
					client_status: messageSentToCustomer ? "contactado" : "error",
					payment: "sin información",
					campaign_status: "activa",
					vendor_phone: row[headers[3]] || "",
					error: error.response?.data || error.message,
				};

				await Leads.findOneAndUpdate(
					{ id_user: telefono.toString() },
					{
						$setOnInsert: {
							name: row[headers[1]] || "",
							channel: "WhatsApp",
							content: "",
							botSwitch: "ON",
							responses: 0,
						},
						$push: { campaigns: campaignDetail },
					},
					{ upsert: true, new: true }
				);

				errorCount++;
				await adminWhatsAppNotification(
					userPhone,
					`*NOTIFICACION de Error de Campaña PedidoYa para ${telefono}-${
						row[headers[1]] || ""
					}:*\n" + ${error.message}`
				);
			}

			// Delay for 3 seconds before sending the next message
			await delay(3000);
		}

		const summaryMessage = `*NOTIFICACION de Campaña Pedido Ya:*\nMensajes enviados: ${successCount}\nErrores: ${errorCount}`;
		await adminWhatsAppNotification(userPhone, summaryMessage);
	} catch (error) {
		console.error("Error processing PedidoYa Campaign Excel:", error.message);
		// Receives the throw new error
		await adminWhatsAppNotification(
			userPhone,
			`*NOTIFICACION de Error de Campaña PedidoYa:*\n${error.message}`
		);
	}
};
