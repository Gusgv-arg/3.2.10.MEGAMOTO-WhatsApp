import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportFlowLeadsToProtectedExcel = async (leads) => {
  try {
    // Crear un nuevo workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leads");

    // Definir las columnas
    worksheet.columns = [
      { header: "Nombre", key: "nombre", width: 20 },
      { header: "Teléfono", key: "idUsuario", width: 15 },
      { header: "Estado", key: "estado", width: 10 },
      { header: "Primer Contacto", key: "fechaFlow", width: 20 },
      { header: "Fecha a Contactar", key: "fechaContactar", width: 15 },
      { header: "Marca", key: "marca", width: 10 },
      { header: "Modelo", key: "modelo", width: 25 },
      { header: "Precio informado", key: "precio", width: 10 },
      { header: "Otros Modelos", key: "otrosModelos", width: 15 },
      { header: "Forma de Pago", key: "formaPago", width: 20 },
      { header: "DNI", key: "dni", width: 10 },
      { header: "Preguntas Lead", key: "preguntas", width: 20 },
      { header: "Vendedor", key: "vendedor", width: 20 },
      { header: "Notas del Vendedor", key: "notas", width: 20 },
      { header: "Historial", key: "historial", width: 20 },
      { header: "Orígen", key: "orígen", width: 10 },
      { header: "Token Flow 2", key: "tokenFlow2", width: 20 },
      { header: "Error", key: "error", width: 10 },
    ];

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
        otrosModelos: lastFlow?.otherProducts || "",
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
      });
    });

    // Desbloquear todas las celdas por defecto
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.protection = { locked: false };
      });
    });

    // Bloquear celdas específicas (Teléfono, Primer Contacto, Preguntas Lead, Historial, Token Flow 2, Error)
    const columnsToProtect = ['A','B', 'D', 'L', 'O', 'Q', 'R'];
    columnsToProtect.forEach((col) => {
      worksheet.getColumn(col).eachCell((cell) => {
        cell.protection = { locked: true };
      });
    });

    // Proteger la hoja de cálculo
    await worksheet.protect('megamoto', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertRows: true,
      insertColumns: false,
      insertHyperlinks: false,
      deleteRows: true,
      deleteColumns: false,
      sort: true,
      autoFilter: true,
      pivotTables: false,
    });

    // Generar nombre para el archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `Leads_${timestamp}.xlsx`;
    const outputPath = path.join(__dirname, "../../public", fileName);

    // Guardar el archivo
    await workbook.xlsx.writeFile(outputPath);

    // Generar y retornar la URL pública
    const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error("Error en exportFlowLeadsToProtectedExcel.js:", error.message);
    throw error.message;
  }
};
