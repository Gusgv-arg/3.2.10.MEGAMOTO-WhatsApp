import Leads from "../../models/leads.js";

export const createLeadInDb = async (userMessage) => {

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
    try {
        // Create Lead
        const flowDetail = {
            flowName: process.env.FLOW_1,
            flowDate: currentDateTime,
            client_status: "contactado",
            messages: "",
            history: "",
            flow_token: "1",
            flow_status: "activo"            
        }
        
        const lead = await Leads.create({
            name: userMessage.name,
            id_user: userMessage.userPhone,
            botSwitch: "ON",
            channel: userMessage.channel, 
            flows: flowDetail
        });
            
        // Save thread in DB
        await lead.save();
        
    } catch (error) {
        console.log("Error en createLeadInDb.js:", error?.response?.data
            ? JSON.stringify(error.response.data)
            : error.message)

        throw error
    }		
};
