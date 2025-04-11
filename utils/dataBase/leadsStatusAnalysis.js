import Leads from '../../models/leads.js';

export const leadsStatusAnalysis = async (userMessage) => {

    // Get all pending leads
    const pendingLeads = await Leads.find({
        flows: {
            $elemMatch: {
                client_status: { $nin: ["compró", "no compró"] }
            }
        }
    });

    // Count total pending leads
    const pendingLeadsCount = pendingLeads.length;

    // Group leads by vendor
    const vendorStats = {};
    let unassignedCount = 0;

    pendingLeads.forEach(lead => {
        const lastFlow = lead.flows[lead.flows.length - 1];
        if (lastFlow.vendor_name) {
            // If vendor doesn't exist in stats, initialize with 0
            if (!vendorStats[lastFlow.vendor_name]) {
                vendorStats[lastFlow.vendor_name] = 0;
            }
            // Increment count for this vendor
            vendorStats[lastFlow.vendor_name]++;
        } else {
            unassignedCount++;
        }
    });

    // Create vendor breakdown message
    let vendorBreakdown = '';
    for (const [vendor, count] of Object.entries(vendorStats)) {
        vendorBreakdown += `\nAsignados ${vendor}: ${count}`;
    }

    const message = `*🔔 Notificación NUEVO LEAD:*\n\nAcaba de entrar un nuevo lead.\nNombre: ${userMessage.name}\n\n📊 *Resumen de leads:*\nLeads pendientes: ${pendingLeadsCount}${vendorBreakdown}\nSin vendedor: ${unassignedCount}\n\nMegamoto`;

    return message;

}