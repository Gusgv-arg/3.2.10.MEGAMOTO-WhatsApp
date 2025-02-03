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

        // Verificar si getRange está disponible
        const hasGetRange = typeof workbook.getWorksheet("Status Válidos")?.getRange === "function";

        // Función para obtener un rango compatible con todas las versiones
        const getRange = (sheetName, rangeAddress) => {
            const sheet = workbook.getWorksheet(sheetName);
            if (!sheet) {
                throw new Error(`No se encontró la hoja: ${sheetName}`);
            }
            if (hasGetRange) {
                return sheet.getRange(rangeAddress); // Usar getRange si está disponible
            } else {
                return { address: rangeAddress }; // Simular un rango usando la dirección
            }
        };

        // Configurar listas desplegables usando los nuevos rangos
        const statusRange = getRange("Status Válidos", "A1:A17"); // Rango para Status Válidos
        const marcasRange = getRange("Marcas", "H1:H8"); // Rango para Marcas
        const vendedoresRange = getRange("Vendedores", "A1:A11"); // Rango para Vendedores
        const origenRange = getRange("Orígen", "A1:A4"); // Rango para Orígen

        // Seleccionar la hoja principal para agregar datos
        const mainWorksheet = workbook.getWorksheet(1); // Suponiendo que la hoja principal es la primera
        if (!mainWorksheet) {
            throw new Error("No se encontró la hoja principal para agregar datos.");
        }

        // Aplicar validaciones de datos (listas desplegables) en la hoja principal
        mainWorksheet.getColumn(3).dataValidation = {
            type: "list",
            formulae: [statusRange.address],
            allowBlank: true,
        };
        mainWorksheet.getColumn(6).dataValidation = {
            type: "list",
            formulae: [marcasRange.address],
            allowBlank: true,
        };
        mainWorksheet.getColumn(13).dataValidation = {
            type: "list",
            formulae: [vendedoresRange.address],
            allowBlank: true,
        };
        mainWorksheet.getColumn(16).dataValidation = {
            type: "list",
            formulae: [origenRange.address],
            allowBlank: true,
        };

        console.log("Listas desplegables configuradas.");

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

            // Obtener la primera tabla de la hoja principal
            const mainTable = mainWorksheet.tables?.[0]; // Usar operador opcional (?)
            if (!mainTable) {
                throw new Error("No se encontró ninguna tabla en la hoja principal.");
            }

            // Calcular la próxima fila después del rango actual de la tabla
            const [startCell, endCell] = mainTable.ref.split(":");
            const nextRowNum = parseInt(endCell.replace(/[A-Z]/g, "")) + 1; // Extraer el número de fila
            const newRow = mainWorksheet.getRow(nextRowNum);

            // Agregar los datos a la nueva fila (ajustado según tu solicitud)
            newRow.values = [
                lead.name, // Columna 1: Nombre
                lead.id_user, // Columna 2: ID de usuario
                lastFlow?.client_status, // Columna 3: Estado del cliente (validado por Status Válidos)
                lastFlow?.flowDate, // Columna 4: Fecha del flujo
                lastFlow?.toContact, // Columna 5: Fecha para contactar
                lastFlow?.brand, // Columna 6: Marca (validado por Marcas)
                lastFlow?.model, // Columna 7: Modelo
                lastFlow?.price, // Columna 8: Precio
                lastFlow?.otherProducts, // Columna 9: Otros productos
                lastFlow?.payment, // Columna 10: Forma de pago
                lastFlow?.dni, // Columna 11: DNI
                lastFlow?.questions, // Columna 12: Preguntas
                lastFlow?.vendor_name, // Columna 13: Vendedor (validado por Vendedores)
                lastFlow?.vendor_notes, // Columna 14: Notas del vendedor
                lastFlow?.history, // Columna 15: Historial
                lastFlow?.origin || "API General", // Columna 16: Origen (validado por Orígen o "API General" por defecto)
                lastFlow?.flow_2token, // Columna 17: Token del flujo 2
                lastFlow?.error, // Columna 18: Errores
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