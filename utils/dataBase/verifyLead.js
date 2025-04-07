import Leads from "../../models/leads.js";
import { v4 as uuidv4 } from "uuid";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";

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

// Función que verifica si el vendedor envió un teléfono para verificar el lead
export const verifyLead = async (userPhone, message) => {
    // Verificar si el mensaje comienza con al menos 5 cifras
    const regex = /^(\d{5,})(.*)/;
    const match = message.match(regex);

    if (!match) {
        return false; // Si no hay coincidencia, retornar false
    }

    // Extraer el id_user y el nombre del mensaje
    const id_user = match[1].trim(); // Primer grupo: las 5 cifras
    const name = match[2].trim(); // Segundo grupo: el resto del mensaje

    try {
        // Buscar en la base de datos si el id_user existe
        let user = await Leads.findOne({ id_user });

        if (!user) {
            // Si no existe, crear un nuevo registro
            const flow_2token = `2+${uuidv4()}`;

            user = new Leads({
                id_user,
                name,
                channel: "whatsapp",
                flows: [
                    {
                        flowName: "registro manual",
                        flowDate: currentDateTime,
                        client_status: "vendedor",
                        statusDate: currentDate.toISOString(),
                        vendor_phone: "",
                        vendor_name: "",
                        origin: "Salón",
                        history: "Alta manual",
                        flow_2token,
                        flow_status: "activo",
                    },
                ],
            });

            await user.save();
            console.log(`Nuevo registro creado para id_user: ${id_user}`);

            // Notificar al usuario que se ha creado un nuevo registro
            const message = `*🔔 Notificación MEGAMOTO:*\n\n✅ Tu lead con el teléfono ${id_user} fue creado exitosamente. Para completar el resto de los datos podés enviar la palabra "leads", recibir el Excel y volver a enviarlo con toda la información de la operación.\n\n*Megamoto*`;

            await handleWhatsappMessage(userPhone, message)
            return;

        } else {
            // Si el usuario ya existe, verificar el último flow_status
            const lastFlow = user.flows[user.flows.length - 1];

            if (lastFlow && lastFlow.flow_status !== "compró" && lastFlow.flow_status !== "no compró") {
                // Si el último flow_status es distinto de "compró" o "no compró"
                const message = `*🔔 Notificación MEGAMOTO:*\n\n❌ El lead tiene una operación en curso. Vendedor: ${lastFlow.vendor_name}, Teléfono: ${lastFlow.vendor_phone}\n\n*Megamoto*`;

                await handleWhatsappMessage(userPhone, message)
                
                return

            } else {
                // Si el último flow_status es "compró" o "no compró", agregar un nuevo registro en flows
                const flow_2token = `2+${uuidv4()}`;

                const newFlow = {
                    flowName: "registro manual",
                    flowDate: currentDateTime,
                    client_status: "vendedor",
                    statusDate: currentDateTime,
                    origin: "Salón",
                    history: `${currentDateTime} Alta manual`,
                    flow_2token,
                    flow_status: "activo",
                };

                user.flows.push(newFlow);
                await user.save();

                console.log(`Nuevo flow agregado para id_user: ${id_user}`);
                
                const message = `*🔔 Notificación MEGAMOTO:*\n\n✅ Tu lead con el teléfono ${id_user} fue creado exitosamente y NO es la primera vez que nos consulta. Para completar el resto de los datos podés enviar la palabra "leads", recibir el Excel y volver a enviarlo con toda la información de la operación.\n\n*Megamoto*`;

                await handleWhatsappMessage(userPhone, message)
                return
            }
        }
    } catch (error) {
        console.error("Error en verifyLead.js:", error);
        const errorMessage = error?.response?.data
		? JSON.stringify(error.response.data)
		: error.message
        
        throw new Error(errorMessage);
    }
};