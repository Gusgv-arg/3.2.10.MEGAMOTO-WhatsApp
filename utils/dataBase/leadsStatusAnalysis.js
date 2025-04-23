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
    const vendorStats = {};
    const statusStats = {};    
    
    pendingLeads.forEach(lead => {
        const lastFlow = lead.flows[lead.flows.length - 1];
        if (lastFlow.vendor_name) {
            if (!vendorStats[lastFlow.vendor_name]) {
                vendorStats[lastFlow.vendor_name] = 0;
            }
            vendorStats[lastFlow.vendor_name]++;
        }

        // Count by client_status instead of unassigned
        const status = lastFlow.client_status || 'sin status';
        if (!statusStats[status]) {
            statusStats[status] = 0;
        }
        statusStats[status]++;
    });

    // Create vendor breakdown message
    let vendorBreakdown = '';
    for (const [vendor, count] of Object.entries(vendorStats)) {
        vendorBreakdown += `\nAsignados a ${vendor}: ${count}`;
    }

    // Create status breakdown message
    let statusBreakdown = '';
    for (const [status, count] of Object.entries(statusStats)) {
        statusBreakdown += `\n${status}: ${count}`;
    }

    let message 
    if (userMessage) {
        message = `*🔔 Notificación MEGAMOTO:*\n\n🎉 Acaba de entrar un nuevo lead.\nNombre: *${userMessage.name}*\n\n📊 *Resumen de leads:*\nLeads pendientes: ${pendingLeadsCount}${vendorBreakdown}\n${statusBreakdown}\n\n*Megamoto*`;
    } else {
        message = `*🔔 Notificación MEGAMOTO:*\n\n📊 *Resumen de leads:*\nLeads pendientes: ${pendingLeadsCount}${vendorBreakdown}\n${statusBreakdown}\n\n*Megamoto*`;
    }

    return message;

}