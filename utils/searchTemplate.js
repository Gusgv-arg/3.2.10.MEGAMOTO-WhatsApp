import dotenv from "dotenv";
import axios from "axios";
import { adminWhatsAppNotification } from "./adminWhatsAppNotification.js";

const whatsappBusinessId = process.env.WHATSAPP_BUSINESS_ID;
const whatsappToken = process.env.WHATSAPP_TOKEN;

//Function that searches WhatsApp body Template
export const searchTemplate = async (templateName, userPhone) => {
	try {
		// Get WhatsApp Templates from Facebook
		const urlTemplates = `https://graph.facebook.com/v20.0/${whatsappBusinessId}/message_templates?fields=name,status`;
		
		const response = await axios.get(urlTemplates, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${whatsappToken}`,
			},
		});
		//console.log("response de templates:", response.data);

		// Filter needed Template to get the Template ID
		const allTemplates = response.data.data;
		const desiredTemplate = allTemplates.find(
			(template) => template.name === templateName
		);

		if (!desiredTemplate) {
			throw new Error(`No se encontró una Plantilla de WhatsApp de nombre "${templateName}". Puede verificar el mismo en el Administrador de WhatsApp en la sección de Plantillas.`);
		}

		const templateId = desiredTemplate.id;
		//console.log("Template ID", templateId)

		// With Template ID get the body
		const urlTemplateBody = `https://graph.facebook.com/v20.0/${templateId}`;

		const response2 = await axios.get(urlTemplateBody, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${whatsappToken}`,
			},
		});

		const templateData = response2.data;
		//console.log("Templatedata:", templateData)
		
		const bodyComponent = templateData.components.find(
			(component) => component.type === "BODY"
		);

		if (!bodyComponent) {
			throw new Error("La Plantilla de WhatsApp no tiene el componente Body. Revise el Administrador de WhatsApp en la sección de Plantillas.");
		}

		const templateContent = bodyComponent.text;

		return templateContent;
	} catch (error) {
		console.log("Error en searchTemplate.js", error.message);
		await adminWhatsAppNotification(userPhone,`*NOTIFICACION de Error de Campaña:*\n${error.message}`);
	}
};