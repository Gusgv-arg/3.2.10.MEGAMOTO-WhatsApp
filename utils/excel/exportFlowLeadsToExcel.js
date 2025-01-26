import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import Leads from "../../models/leads.js";
import Prices from "../../models/prices.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportFlowLeadsToExcel = async (leads) => {
	try {
		// Lista de Status, Marcas y Modelos válidos
		const validClientStatuses = Leads.schema.path(
			"flows.client_status"
		).enumValues;
		console.log("Status:", validClientStatuses)
		const validBrands = await Prices.distinct("marca").exec();
		console.log("Marcas:", validBrands)
		const validModels = await Prices.distinct("modelo").exec();
		console.log("Modelos:", validModels)

		// Limpiar las marcas y modelos
		const cleanedModels = validModels.map(model => model.trim().replace(/[^a-zA-Z0-9\s]/g, ''));
		// Limitar la cantidad de marcas y modelos (por ejemplo, a 50)

		const limitedModels = validModels.slice(0, 50);

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

		// Convertir las opciones en una cadena separada por comas y entre comillas
		const listaDesplegableStatus = `"${validClientStatuses.join(",")}"`;
		const listaDesplegableBrands = `"${validBrands.join(",")}"`;
		const listaDesplegableModels = `"${limitedModels.join(",")}"`;

		// Log para verificar las listas de validación
		console.log("Dropdown Status List:", listaDesplegableStatus);
		console.log("Dropdown Brands List:", listaDesplegableBrands);
		console.log("Dropdown Models List:", listaDesplegableModels);
		
		// Add data validation to Estado column
		const stateColumn = worksheet.getColumn("estado");
		stateColumn.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
			if (rowNumber > 1) {
				// Ignorar encabezado
				cell.dataValidation = {
					type: "list",
					allowBlank: true,
					formulae: [listaDesplegableStatus],
					showErrorMessage: true,
					errorTitle: "Estado inválido",
					errorStyle: "stop",
					error: "Selecciona un estado válido de la lista.",
				};
			}
		});

		// Add data validation to Marca column
		const brandColumn = worksheet.getColumn("marca");
		brandColumn.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
			if (rowNumber > 1) {
				cell.dataValidation = {
					type: "list",
					allowBlank: true,
					formulae: [listaDesplegableBrands],
					showErrorMessage: true,
					errorTitle: "Marca inválida",
					errorStyle: "stop",
					error: "Selecciona una marca válida de la lista.",
				};
			}
		});

		// Add data validation to Modelo column
		const modelColumn = worksheet.getColumn("modelo");
		modelColumn.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
			if (rowNumber > 1) {
				cell.dataValidation = {
					type: "list",
					allowBlank: true,
					formulae: [listaDesplegableModels],
					showErrorMessage: true,
					errorTitle: "Modelo inválido",
					errorStyle: "stop",
					error: "Selecciona un modelo válido de la lista.",
				};
			}
		});

		// Generar nombre único para el archivo
		//const fileName = `leads-${Date.now()}.xlsx`;
		const fileName = `leads.xlsx`;
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
//exportFlowLeadsToExcel()