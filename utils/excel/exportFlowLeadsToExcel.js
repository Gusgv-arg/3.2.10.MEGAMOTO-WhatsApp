import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import Leads from "../../models/leads.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de estados válidos
const validClientStatuses = Object.values(
	Leads.schema.paths.flows.schema.paths.client_status.enum
);

export const exportFlowLeadsToExcel = async (leads) => {
    console.log("Status validos:", validClientStatuses)
	try {
		// Crear un nuevo workbook
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Leads");
		const statusSheet = workbook.addWorksheet("Status Válidos"); // Nueva hoja para estados válidos

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
			{ header: "Forma de Pago", key: "formaPago", width: 20 },
			{ header: "DNI", key: "dni", width: 10 },
			{ header: "Preguntas Lead", key: "preguntas", width: 20 },
			{ header: "Vendedor", key: "vendedor", width: 20 },
			{ header: "Teléfono Vendedor", key: "telefonoVendedor", width: 25 },
			{ header: "Notas del Vendedor", key: "notas", width: 20 },
			{ header: "Historial", key: "historial", width: 20 },
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
				formaPago: lastFlow?.payment || "",
				dni: lastFlow?.dni || "",
				preguntas: lastFlow?.questions || "",
				notas: lastFlow?.vendor_notes || "",
				vendedor: lastFlow?.vendor_name || "",
				telefonoVendedor: lastFlow?.vendor_phone || "",
				estadoFlow: lastFlow?.flow_status || "",
				historial: lastFlow?.history || "",
				error: lastFlow?.error || "",
				tokenFlow2: lastFlow?.flow_2token || "",
			});
		});

		// Agregar los estados válidos a la nueva hoja
		validClientStatuses.forEach((status, index) => {
			const cell = statusSheet.getCell(`A${index + 1}`); // Colocar cada estado en una celda
			cell.value = status; // Asignar el valor
			cell.style = { alignment: { vertical: "middle", horizontal: "left" } }; // Alinear el texto
		});

		// Asegurarse de que la hoja de estados válidos tenga un rango definido
		statusSheet.getColumn("A").width = 30; // Ajustar el ancho de la columna para mejor visualización

		// Agregar validación de datos para el campo de Estado en la hoja de Leads
		const stateColumn = worksheet.getColumn("estado");
		stateColumn.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
			if (rowNumber > 1) {
				// Evitar la cabecera
				cell.dataValidation = {
					type: "list",
					allowBlank: true,
					formula1: `Valid Client Statuses!$A$1:$A$${validClientStatuses.length}`, // Referencia al rango de estados válidos
					showErrorMessage: true,
					errorTitle: "Estado inválido",
					error: "Por favor, elige un estado válido de la lista.",
				};
			}
		});

		// Generar nombre único para el archivo
		const fileName = `leads-${Date.now()}.xlsx`;
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
