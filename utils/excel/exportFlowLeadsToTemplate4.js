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
        await workbook.xlsx.load(response.data, { sheetRows: Infinity });

        // Depurar el contenido de las hojas
        console.log("Depurando contenido de las hojas...");
        workbook.eachSheet((sheet) => {
            console.log(`Hoja: ${sheet.name}`);
            console.log("Contenido de la hoja:");
            sheet.eachRow((row, rowNumber) => {
                console.log(`  Fila ${rowNumber}:`, row.values);
            });
        });

        // Verificar si las tablas existen
        let tablesFound = false;
        workbook.eachSheet((sheet) => {
            if (sheet.tables && sheet.tables.length > 0) {
                sheet.tables.forEach((table) => {
                    console.log(`Tabla encontrada: ${table.name} en la hoja ${sheet.name}`);
                    tablesFound = true;
                });
            }
        });

        if (!tablesFound) {
            console.warn("No se encontraron tablas en ninguna hoja. Usando rangos en su lugar.");
        }

        // Seleccionar la hoja principal para agregar datos
        const mainWorksheet = workbook.getWorksheet(1); // Suponiendo que la hoja principal es la primera
        if (!mainWorksheet) {
            throw new Error("No se encontró la hoja principal para agregar datos.");
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

        // Configurar listas desplegables usando rangos
        const statusRange = workbook.getWorksheet("Status Válidos").getRange("A1:A17"); // Suponiendo que la lista está en la columna A
        const marcaRange = workbook.getWorksheet("Marca2").getRange("H12:H8");
        const vendedoresRange = workbook.getWorksheet("Vendedores").getRange("A1:A11");
        const origenRange = workbook.getWorksheet("Orígen").getRange("A1:A4");

        mainWorksheet.getColumn(4).dataValidation = {
            type: "list",
            formulae: [statusRange.address],
            allowBlank: true,
        };
        mainWorksheet.getColumn(8).dataValidation = {
            type: "list",
            formulae: [marcaRange.address],
            allowBlank: true,
        };
        mainWorksheet.getColumn(15).dataValidation = {
            type: "list",
            formulae: [vendedoresRange.address],
            allowBlank: true,
        };
        mainWorksheet.getColumn(19).dataValidation = {
            type: "list",
            formulae: [origenRange.address],
            allowBlank: true,
        };

        console.log("Listas desplegables configuradas usando rangos.");

        // Agregar los datos dentro de la tabla
        leads.forEach((lead, index) => {
            const lastFlow = lead.lastFlow;

            // Obtener la primera tabla de la hoja principal
            const mainTable = mainWorksheet.tables?.[0]; // Usar operador opcional (?)
            if (!mainTable) {
                throw new Error("No se encontró ninguna tabla en la hoja principal.");
            }

            // Calcular la próxima fila después del rango actual de la tabla
            const [startCell, endCell] = mainTable.ref.split(":");
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