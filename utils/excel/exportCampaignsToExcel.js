import path from "path";
import { fileURLToPath } from "url";
import xlsx from "xlsx";
import Leads from "../../models/leads.js";

const myPhone = process.env.MY_PHONE;
const myPhone2 = process.env.MY_PHONE2;
const myMail = process.env.MY_MAIL;
const myMail2 = process.env.MY_MAIL2;

export const exportCampaignsToExcel = async (userPhone) => {
	
	// Determine which Admin has sent the order
	let mail;
	if (userPhone === myPhone) {
		mail = myMail;
	} else if (userPhone === myPhone2) {
		mail = myMail2;
	}

	try {
		// Obtén todos los leads de la base de datos
		const leads = await Leads.find({});

		// Convierte los leads a un formato que xlsx pueda entender
		const leadsForXlsx = leads.map((lead) => {
			const campaignData = lead.campaigns.map((campaign) => ({
				Campaña: campaign.campaignName,
				Fecha_Campaña: campaign.campaignDate,
				Status_Campaña: campaign.campaign_status,
				Status_Cliente: campaign.client_status,
				Método_Pago: campaign.payment,
				Mensajes: campaign.messages,
				Error_Campaña: campaign.error,
			}));

			// Crea un objeto con los datos del lead y agrega las campañas como columnas
			const leadData = {
				Nombre: lead.name,
				Teléfono: lead.id_user,
				Mensajes_fuera_de_Campaña: lead.content 								
			};

			// Agrega los datos de las campañas al objeto leadData
			campaignData.forEach((campaign, index) => {
				Object.keys(campaign).forEach((key) => {
					leadData[`${key}_${index + 1}`] = campaign[key]; // Agrega un sufijo para cada campaña
				});
			});

			return leadData;
		});

		const wb = xlsx.utils.book_new();
		const ws = xlsx.utils.json_to_sheet(leadsForXlsx);
		xlsx.utils.book_append_sheet(wb, ws, "Leads");

		// Define un nombre de archivo temporal para el archivo Excel
		const tempFilePath = "excel/Leads.xlsx";
		xlsx.writeFile(wb, tempFilePath);
		//console.log("Leads DB exported to Leads.xlsx");

		// Obtiene la ruta completa del archivo temporal
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const filePath = path.join(__dirname, "../", tempFilePath);

		// Envía el archivo por correo electrónico
		await sendLeadsByMail(filePath, mail, userPhone);

	} catch (error) {
		console.error("Error in exportCampaignsToExcel.js:", error.message);
		throw error;
	}
};
