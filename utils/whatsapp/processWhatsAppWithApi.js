import { sendFlow_1ToLead } from "../../flows/sendFlow_1ToLead.js";
import Leads from "../../models/leads.js";
import { createLeadInDb } from "../dataBase/createLeadInDb.js";
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
            // Lead tiene un Flow abierto
                // Lead tiene vendedor asignado
                    // Mandar mensaje al cliente que el vendedor X lo va a llamar
                // Lead NO tiene vendedor asigando
                    // Mandar mensaje al cliente que se le pasa su consulta a un vendedor
            
            // Lead NO tiene un Flow abierto
                // Envía el Flow 1 al lead
        

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
