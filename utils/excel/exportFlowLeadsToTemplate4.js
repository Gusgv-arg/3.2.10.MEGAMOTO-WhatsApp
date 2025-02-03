import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios"; // Importar axios

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportFlowLeadsToTemplate4 = async (leads) => {
    try {
        const leadsTemplate = "https://raw.githubusercontent.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/main/public/temp/PlantillaLeads.xlsx";
        
        // Cargar la plantilla de Excel usando axios
        const response = await axios.get(leadsTemplate, { responseType: 'arraybuffer' });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(response.data);
        const worksheet = workbook.getWorksheet(1); // Obtener la primera hoja de la plantilla

        // Desproteger la hoja si está protegida
        /* if (worksheet.protect) {
            worksheet.unprotect(); // Desactivar protección
        } */

        // Deshabilitar filtros automáticos en todas las tablas
        workbook.eachSheet((sheet) => {
            sheet.tableCollection.each((table) => {
                table.autoFilter = null; // Elimina los filtros automáticos de la tabla
                console.log(`Filtros automáticos deshabilitados en la tabla: ${table.name}`);
            });
        });

        // Limpiar el contenido de las celdas sin eliminar las filas
        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.value = null; // Limpia el valor de la celda
            });
        }

        // Agregar los datos dentro de la tabla
        leads.forEach((lead, index) => {
            const lastFlow = lead.lastFlow;

            // Obtener la última fila de la tabla
            const table = worksheet.tables[0]; // Suponiendo que hay una sola tabla en la hoja
            if (!table) throw new Error("No se encontró ninguna tabla en la hoja.");

            const nextRowNum = parseInt(table.ref.split(":")[1].replace(/[A-Z]/g, "")) + 1; // Calcular la próxima fila
            const newRow = worksheet.getRow(nextRowNum);

            // Agregar los datos a la nueva fila
            newRow.values = [
                lead.name,
                lead.id_user,
                lastFlow?.client_status,
                lastFlow?.flowDate,
                lastFlow?.toContact,
                lastFlow?.brand,
                lastFlow?.model,
                lastFlow?.price,
                lastFlow?.otherProducts,
                lastFlow?.payment,
                lastFlow?.dni,
                lastFlow?.questions,
                lastFlow?.vendor_name,
                lastFlow?.vendor_notes,
                lastFlow?.history,
                lastFlow?.origin || "API General",
                lastFlow?.flow_2token,
                lastFlow?.error,
            ];

            // Ajustar el rango de la tabla para incluir la nueva fila
            table.ref = `${table.ref.split(":")[0]}:${newRow.address}`;
        });

        // Generar nombre para el archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `Leads_${timestamp}.xlsx`;
        const outputPath = path.join(__dirname, "../../public", fileName);

        // Guardar el archivo
        await workbook.xlsx.writeFile(outputPath);

        // Reactivar protección si estaba activada
        if (!worksheet.protect) {
            worksheet.protect("password"); // Reactivar protección con contraseña
        }

        // Generar y retornar la URL pública
        const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/${fileName}`;
        return fileUrl;

    } catch (error) {
        console.error("Error en exportFlowLeadsToExcel.js:", error.message);
        throw error.message;
    }
};