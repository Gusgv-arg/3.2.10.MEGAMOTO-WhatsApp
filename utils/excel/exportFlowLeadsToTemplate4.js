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

        // Seleccionar la hoja principal para agregar datos
        const mainWorksheet = workbook.getWorksheet(1); // Suponiendo que la hoja principal es la primera
        if (!mainWorksheet) {
            throw new Error("No se encontró la hoja principal para agregar datos.");
        }

        // Verificar si existe una tabla en la hoja principal
        let mainTable = mainWorksheet.tables?.[0]; // Obtener la primera tabla de la hoja
        if (!mainTable) {
            console.warn("No se encontró ninguna tabla en la hoja principal. Creando una nueva tabla...");

            // Definir el rango inicial para la tabla (ajusta según tu plantilla)
            const tableRange = "A1:R1"; // Suponiendo que las columnas van de A a R

            // Crear una nueva tabla
            mainTable = mainWorksheet.addTable({
                name: "MainTable", // Nombre de la tabla
                ref: tableRange, // Rango inicial de la tabla
                headerRow: true, // Indica si la primera fila es un encabezado
                totalsRow: false, // No incluir fila de totales
            });

            console.log("Tabla creada exitosamente.");
        }

        // Desproteger la hoja si está protegida
        if (mainWorksheet.protect) {
            mainWorksheet.unprotect(); // Desactivar protección
        }

        // Limpiar el contenido de las celdas sin eliminar las filas
        for (let i = 2; i <= mainWorksheet.rowCount; i++) {
            const row = mainWorksheet.getRow(i);
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.value = null; // Limpia el valor de la celda
            });
        }

        // Agregar los datos dentro de la tabla
        leads.forEach((lead, index) => {
            const lastFlow = lead.lastFlow;

            // Calcular la próxima fila después del rango actual de la tabla
            const tableRange = mainTable.ref;
            const [startCell, endCell] = tableRange.split(":");
            const nextRowNum = parseInt(endCell.replace(/[A-Z]/g, "")) + 1; // Extraer el número de fila
            const newRow = mainWorksheet.getRow(nextRowNum);

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
            mainTable.ref = `${startCell}:${newRow.address}`;
        });

        // Generar nombre para el archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `Leads_${timestamp}.xlsx`;
        const outputPath = path.join(__dirname, "../../public", fileName);

        // Guardar el archivo
        await workbook.xlsx.writeFile(outputPath);

        // Reactivar protección si estaba activada
        if (!mainWorksheet.protect) {
            mainWorksheet.protect("password"); // Reactivar protección con contraseña
        }

        // Generar y retornar la URL pública
        const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/${fileName}`;
        return fileUrl;

    } catch (error) {
        console.error("Error en exportFlowLeadsToExcel.js:", error.message);
        throw error.message;
    }
};