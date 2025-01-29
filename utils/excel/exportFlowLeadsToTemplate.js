import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios"; // Importar axios

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportFlowLeadsToTemplate = async (leads) => {
    try {
        const leadsTemplate = "https://raw.githubusercontent.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/main/public/temp/PlantillaLeads.xlsx";
        
        // Cargar la plantilla de Excel usando axios
        const response = await axios.get(leadsTemplate, { responseType: 'arraybuffer' });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(response.data);
        const worksheet = workbook.getWorksheet(1); // Obtener la primera hoja de la plantilla
        
        // Limpiar la hoja antes de agregar nuevos datos
        worksheet.getRow(2).commit(); // Asegurarse de que la fila de encabezado no se sobrescriba
        worksheet.spliceRows(2, worksheet.rowCount - 1); // Eliminar filas existentes (excepto encabezados)

        // Agregar los datos
        leads.forEach((lead) => {
            const lastFlow = lead.lastFlow;
            worksheet.addRow({
                nombre: lead.name,
                idUsuario: lead.id_user,
                botSwitch: lead.botSwitch,
                estado: lastFlow?.client_status || "",
                fechaFlow: lastFlow?.flowDate || "",
                fechaContactar: lastFlow?.toContact || "",
                marca: lastFlow?.brand || "",
                modelo: lastFlow?.model || "",
                precio: lastFlow?.price || "",
                formaPago: lastFlow?.payment || "",
                dni: lastFlow?.dni || "",
                preguntas: lastFlow?.questions || "",
                notas: lastFlow?.vendor_notes || "",
                vendedor: lastFlow?.vendor_name || "",
                estadoFlow: lastFlow?.flow_status || "",
                historial: lastFlow?.history || "",
                error: lastFlow?.error || "",
                tokenFlow2: lastFlow?.flow_2token || "",
                orígen: lastFlow?.origin || "",
                otrosModelos: lastFlow?.otherProducts || ""
            });
        });
        
        // Generar nombre para el archivo
        const fileName = `Leads_Megamoto.xlsx`;
        const outputPath = path.join(__dirname, "../../public", fileName);

        // Guardar el archivo
        await workbook.xlsx.writeFile(outputPath);

        // Generar y retornar la URL pública
        const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/${fileName}`;
        return fileUrl;
    
    } catch (error) {
        console.error("Error en exportFlowLeadsToExcel.js:", error.message);
        throw error.message;
    }
};
