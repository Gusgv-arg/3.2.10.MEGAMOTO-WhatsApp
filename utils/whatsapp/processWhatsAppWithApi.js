import { sendFlow_1ToLead } from "../../flows/sendFlow_1ToLead.js";
import Leads from "../../models/leads.js";
import { createLeadInDb } from "../dataBase/createLeadInDb.js";
import { saveNotificationInDb } from "../dataBase/saveNotificationInDb.js";
import { handleWhatsappMessage } from "./handleWhatsappMessage.js";

export const processWhatsAppWithApi = async (userMessage) => {
	
    let existingLead;
	let notification;
    let log;

	try {
		// Busca el Lead
		existingLead = await Leads.findOne({ id_user: userMessage.userPhone });

		// Lead NO EXISTE -----------------------------------------------------------
		if (!existingLead) {
			// Llama a la función para crear el Lead y guardar en BD
			existingLead = await createLeadInDb(userMessage);

			// Envía un mensaje previo de bienvenida x si no se ve el Flow
			const greeting = `¡Hola, gracias por contactarte con Megamoto! Para atenderte mejor, vas a recibir otro mensaje el cual te pedimos que completes.\n\nImportante: si estas en tu pc y no ves un segundo mensaje entrá en tu celular.\n\n*¡Tu moto está más cerca en MEGAMOTO!*`;

			await handleWhatsappMessage(userMessage.userPhone, greeting);

			// Envía el Flow 1 al lead
			await sendFlow_1ToLead(userMessage);
			
			// Graba notificación al cliente en la BDs 
			await saveNotificationInDb(userMessage, greeting);

			// Actualiza el log
            log = "1-Se creo el lead en BD. 2-Se mandó saludo inicial. 3-Se mandó Flow 1."
            return log
		
        } else {
		// Lead EXISTE -------------------------------------------------------------
		
            const lastFlow = existingLead.flows[existingLead.flows.length - 1];
			const lastFlowStatus = lastFlow.client_status;
			const lastFlowVendor = lastFlow.vendor_name;
			const lastFlowPhone = lastFlow.vendor_phone;

			let notification;

			if (lastFlowStatus !== "compró" && lastFlowStatus !== "no compró") {
				// El Lead está en la Fila
				
                if (lastFlowVendor) {
					// El lead ya tiene un vendedor asignado

					notification = `*Notificación automática*\nEstimado ${userMessage.name}; le enviaremos tu consulta a tu vendedor asignado que te recordamos es ${lastFlowVendor} con el celular ${lastFlowPhone}. Agendalo para identificarlo cuando te contacte. Te pedimos un poco de paciencia.\n¡Haremos lo posible para atenderte cuanto antes!\n\n*MEGAMOTO* `;

					// Envía notificación de recordatorio al Lead
					await handleWhatsappMessage(userMessage.userPhone, notification);
                    
					// Envía alarma al vendedor con la pregunta del cliente
                    const alarm = `*NOTIFICACION DEL SISTEMA:*\nEl cliente ${userMessage.name} cel: ${userMessage.userPhone} envió el siguiente mensaje: ${userMessage.message}.\n¡Suerte con tu venta!`
                    
					await handleWhatsappMessage(lastFlowPhone, alarm);
                    
					// Graba notificación al cliente en la BDs (falta grabar la del vendedor)
					await saveNotificationInDb(userMessage, notification);
                
                    // Actualiza el log
                    log = `1-Se notificó al lead recordando su vendedor. 2-Alarma al vendedor ${lastFlowVendor}. `
                    
                    return log
                    
				} else {
                    // El Lead NO tiene un vendedor asignado
					notification = `*Notificación automática*\nEstimado ${userMessage.name}; le estaremos enviando tu consulta a un vendedor. Haremos lo posible para asignarte uno cuando antes y te notificaremos con sus datos.\n\n*¡Tu moto está más cerca en MEGAMOTO!*`;
                    
					// Envía notificación al Lead
					await handleWhatsappMessage(userMessage.userPhone, notification);
                    
					// Graba la notificación en la base de datos
					await saveNotificationInDb(userMessage, notification);
                    
                    // Actualiza el log
                    log = `1-Se notificó al Lead de que no tiene un vendedor asignado. `
                    
                    return log
					
                    //------- VER SI A FUTURO CREO UNA ALARMA EN ESTA INSTANCIA O ALGUN PROCESO ESPECIAL -------
				}
			} else {
                // Lead ya existe y NO tiene un Flow abierto arranca el proceso de 0.
				
                // Envía un mensaje previo de bienvenida x si no se ve el Flow
				const greeting2 = `¡Hola nuevamente, gracias por seguir confiando en Megamoto!\nPara atenderte mejor, vas a recibir otro mensaje el cual te pedimos que completes.\n\n*Importante: si estas en tu pc y no ves un segundo mensaje entrá en tu celular*. \n\n*¡Tu moto está más cerca en MEGAMOTO!*`;
                
				await handleWhatsappMessage(userMessage.userPhone, greeting2);
                
				// Envía el Flow 1
				await sendFlow_1ToLead(userMessage);
                
                // Actualiza el log
                log = `1-Se volvió a saludar al lead ya que estaba en BD y no tenía un Flow. 2-Se le envió Flow 1.`

                return log
			}
		}

	} catch (error) {
		console.error(
			"Error in processWhatsAppWithApi.js:",
			error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message
		);

		const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		throw errorMessage;
	}
};
