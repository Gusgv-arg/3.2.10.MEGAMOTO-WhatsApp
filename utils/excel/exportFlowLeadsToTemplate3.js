import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios"; // Importar axios

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const exportFlowLeadsToTemplate3 = async (leads) => {
    try {
        const leadsTemplate = "https://raw.githubusercontent.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/main/public/temp/PlantillaLeads.xlsx";
        
        // Cargar la plantilla de Excel usando axios
        const response = await axios.get(leadsTemplate, { responseType: 'arraybuffer' });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(response.data);
        const worksheet = workbook.getWorksheet(1); // Obtener la primera hoja de la plantilla

        // Desproteger la hoja si está protegida
        if (worksheet.protection.sheet) {
            worksheet.protection = { sheet: false };
        }

        // Limpiar el contenido de las celdas sin eliminar las filas
        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.value = null; // Limpia el valor de la celda
            });
        }

        // Agregar los datos
        leads.forEach((lead, index) => {
            const lastFlow = lead.lastFlow;
            worksheet.addRow({
                nombre: lead.name,
                idUsuario: lead.id_user,
                botSwitch: lead.botSwitch,
                estado: lastFlow?.client_status,
                fechaFlow: lastFlow?.flowDate,
                fechaContactar: lastFlow?.toContact || "",
                marca: lastFlow?.brand,
                modelo: lastFlow?.model,
                precio: lastFlow?.price,
                formaPago: lastFlow?.payment,
                dni: lastFlow?.dni || "",
                preguntas: lastFlow?.questions || "",
                notas: lastFlow?.vendor_notes || "",
                vendedor: lastFlow?.vendor_name,
                estadoFlow: lastFlow?.flow_status,
                historial: lastFlow?.history,
                error: lastFlow?.error || "",
                tokenFlow2: lastFlow?.flow_2token,
                orígen: lastFlow?.origin,
                otrosModelos: lastFlow?.otherProducts || ""
            });

            // Copiar validaciones de datos desde la fila de encabezado
            const newRow = worksheet.getRow(index + 2); // La nueva fila (comenzando en la fila 2)
            worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
                const colNum = cell.column.number;
                const newCell = newRow.getCell(colNum);
                if (worksheet.getRow(1).getCell(colNum).dataValidation) {
                    newCell.dataValidation = JSON.parse(JSON.stringify(worksheet.getRow(1).getCell(colNum).dataValidation));
                }
            });
        });

        // Generar nombre para el archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `Leads_${timestamp}.xlsx`;
        const outputPath = path.join(__dirname, "../../public", fileName);

        // Guardar el archivo
        await workbook.xlsx.writeFile(outputPath);

        // Reactivar protección si estaba activada
        if (worksheet.protection.sheet === false) {
            worksheet.protection = { sheet: true };
        }

        // Generar y retornar la URL pública
        const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/${fileName}`;
        return fileUrl;

    } catch (error) {
        console.error("Error en exportFlowLeadsToExcel.js:", error.message);
        throw error.message;
    }
};