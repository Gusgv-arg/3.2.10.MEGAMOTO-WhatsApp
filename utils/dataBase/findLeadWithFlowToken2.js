import Leads from "../../models/leads.js";

// Graba respuestas del FLOW 2 y devuelve los datos del Lead para notificarlo
export const findLeadWithFlowToken2 = async (flowToken, vendorPhone, vendorName, status)=>{

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
        const lead = await Leads.findOne({
            "flows.flow_2token": flowToken
        });

        const flow = lead.flows.find(flow => flow.flow_2token === flowToken);
        flow.vendor_name = vendorName;
        flow.vendor_phone = vendorPhone;
        flow.client_status = status;
        flow.history += `${currentDateTime} - Status: ${status}. `
        await lead.save();

        const customerPhone = lead.id_user
        const customerName = lead.name
        
        return {customerPhone, customerName};
        
} catch (error) {

    console.log("error en findLeadWithFlowToken2.js:", error.data ? error.data : error.message)

    throw error    
}
}