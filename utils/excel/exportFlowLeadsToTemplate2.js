import XLSX from 'xlsx';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportFlowLeadsToTemplate2 = async (leads) => {
    try {
        const leadsTemplate = "https://raw.githubusercontent.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/main/public/temp/PlantillaLeads.xlsx";
        
        // Cargar la plantilla de Excel usando axios
        const response = await axios.get(leadsTemplate, { responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Obtener la primera hoja de la plantilla
        
        // Limpiar la hoja antes de agregar nuevos datos
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let row = 2; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                delete worksheet[cellAddress]; // Eliminar filas existentes (excepto encabezados)
            }
        }

        // Agregar los datos
        leads.forEach((lead) => {
            const lastFlow = lead.lastFlow;
            const newRow = {
                A: lead.name,
                B: lead.id_user,
                C: lead.botSwitch,
                D: lastFlow?.client_status || "",
                E: lastFlow?.flowDate || "",
                F: lastFlow?.toContact || "",
                G: lastFlow?.brand || "",
                H: lastFlow?.model || "",
                I: lastFlow?.price || "",
                J: lastFlow?.payment || "",
                K: lastFlow?.dni || "",
                L: lastFlow?.questions || "",
                M: lastFlow?.vendor_notes || "",
                N: lastFlow?.vendor_name || "",
                O: lastFlow?.flow_status || "",
                P: lastFlow?.history || "",
                Q: lastFlow?.error || "",
                R: lastFlow?.flow_2token || "",
                S: lastFlow?.origin || ""
            };
            const newRowIndex = range.e.r + 1; // Nueva fila
            for (const [key, value] of Object.entries(newRow)) {
                const cellAddress = `${key}${newRowIndex}`;
                worksheet[cellAddress] = { v: value };
            }
        });

        // Generar nombre para el archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const fileName = `Leads_${timestamp}.xlsx`;
        
        const outputPath = path.join(__dirname, "../../public", fileName);

        // Guardar el archivo
        XLSX.writeFile(workbook, outputPath);

        // Generar y retornar la URL pública
        const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/${fileName}`;
        return fileUrl;
    } catch (error) {
        console.error("Error en exportFlowLeadsToExcel.js:", error.message);
        throw error.message;
    }
};