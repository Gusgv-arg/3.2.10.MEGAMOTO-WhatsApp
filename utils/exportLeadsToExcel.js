import xlsx from "xlsx";
import Leads from "../models/leads.js";

export const exportLeadsToExcel = async () => {
	try {
		// Obtén todos los leads de la base de datos
		const leads = await Leads.find({});

		// Convierte los leads a un formato que xlsx pueda entender
		const leadsForXlsx = leads.map((lead) => ({
			name: lead.name,
			channel: lead.channel,
			content: lead.content,
			id_user: lead.id_user,
			createdAt: lead.createdAt,
		}));

		// Crea un nuevo libro de trabajo
		const wb = xlsx.utils.book_new();

		// Convierte los datos a hoja de trabajo
		const ws = xlsx.utils.json_to_sheet(leadsForXlsx);

		// Añade la hoja de trabajo al libro
		xlsx.utils.book_append_sheet(wb, ws, "Leads");

		// Escribe el libro en un archivo .xlsx
		xlsx.writeFile(wb, "excel/Leads.xlsx");
	} catch (error) {
		console.error("An error occurred while exporting leads to Excel:", error);
		throw error;
	}
};
