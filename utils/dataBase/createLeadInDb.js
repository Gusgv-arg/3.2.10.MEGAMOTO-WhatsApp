import Leads from "../../models/leads.js";

export const createLeadInDb = async (userMessage) => {

    try {
        // Create Lead
        const lead = await Leads.create({
            name: userMessage.name,
            id_user: userMessage.userPhone,
            botSwitch: "ON",
            channel: userMessage.channel
        });
        console.log(`Lead ${userMessage.name} creado en base de datos Leads!`);
    
        // Save thread in DB
        await lead.save();
        
    } catch (error) {
        console.log("Error en createLeadInDb.js:", error?.response?.data
            ? JSON.stringify(error.response.data)
            : error.message)

        throw error
    }		
};
