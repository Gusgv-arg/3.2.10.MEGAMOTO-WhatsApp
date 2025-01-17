import { sendFlow_1ToLead } from "../../flows/sendFlow_1ToLead.js";
import Leads from "../../models/leads.js";
import { createLeadInDb } from "../dataBase/createLeadInDb.js";
import { saveNotificationInDb } from "../dataBase/saveNotificationInDb.js";
import { handleWhatsappMessage } from "./handleWhatsappMessage.js";

export const processWhatsAppWithApi = async (userMessage) => {
    
    let existingLead;
    let notification;

    try {
        // Busca el Lead
        existingLead = await Leads.findOne({ id_user: userMessage.userPhone});
        
        // Si NO existe el Lead
        if (!existingLead){
            // Llama a la función para crear el Lead
            existingLead = await createLeadInDb(userMessage)

            // Envía un mensaje previo de bienvenida x si no se ve el Flow
            const greeting = `*¡Gracias por contactarte con Megamoto!*\nPara atenderte mejor, vas a recibir otro mensaje el cual te pedimos que completes.\n*Importante:* si estas en tu pc y no lo ves entrá en tu celular. \n\n¡Tu moto está más cerca!`

            await handleWhatsappMessage(userMessage.userPhone, greeting)

            // Envía el Flow 1 al lead
            await sendFlow_1ToLead(userMessage)
            
        } else {
            
            // Si el lead ya existe 
            const lastFlow = existingLead.flows[existingLead.flows.length-1]
            const lastFlowStatus = lastFlow.client_status 
            const lastFlowVendor = lastFlow.vendor_name
            const lastFlowPhone = lastFlow.vendor_phone
            
            let notification;

            if (lastFlowStatus!== "compró" && lastFlowStatus !== "no compró"){
                // El Lead está en la Fila
                if (lastFlowVendor){
                    // El lead ya tiene un vendedor asignado

                    notification = `Estimado ${userMessage.name}; le enviaremos tu consulta a tu vendedor asignado que te recordamos es ${lastFlowVendor} con el celular ${lastFlowPhone}. Agendalo para identificarlo cuando te contacte. Te pedimos un poco de paciencia.\n¡Haremos lo posible para atenderte cuanto antes!\n\n*MEGAMOTO* `
                    
                    // Envía notificación al Lead
                    await handleWhatsappMessage(userMessage.userPhone, notification)
                    
                    // Graba la notificación en la base de datos
                    await saveNotificationInDb(userMessage, notification)

                    // ---- ACA GENERAR UN PROCESO DE NOTIFICACION AL VENDEDOR CON LA PREGUNTA DEL CLIENTE 

                    //------- VER SI A FUTURO CREO UNA ALARMA EN ESTA INSTANCIA O ALGUN PROCESO ESPECIAL -------
                    
                } else {
                    // El Lead NO tiene un vendedor asignado
                    notification = `Estimado ${userMessage.name}; le estaremos enviando tu consulta al vendedor cuando te sea asignado. Haremos lo posible para asignarte uno cuando antes y te notificaremos con sus datos.\n¡Tu moto está más cerca!\n\n*MEGAMOTO* `
                    
                    // Envía notificación al Lead
                    await handleWhatsappMessage(userMessage.userPhone, notification)
                    
                    // Graba la notificación en la base de datos
                    await saveNotificationInDb(userMessage, notification)

                    //------- VER SI A FUTURO CREO UNA ALARMA EN ESTA INSTANCIA O ALGUN PROCESO ESPECIAL -------
                }
                
            } else {
                // Lead ya existe y NO tiene un Flow abierto. Envía el Flow 1
                await sendFlow_1ToLead(userMessage)
                
            }

            
        

        }   
    
    } catch (error) {
        console.error("Error in processWhatsAppWithApi.js:", error?.response?.data
            ? JSON.stringify(error.response.data)
            : error.message);

        const errorMessage = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message

        throw errorMessage;
    }
}
