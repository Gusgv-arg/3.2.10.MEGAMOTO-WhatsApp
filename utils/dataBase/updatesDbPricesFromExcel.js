import XLSX from "xlsx";
import fs from "fs";
import Prices from "../../models/prices.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Función para leer el archivo Excel desde Google Drive
async function leerExcel(archivoURL) {
	const response = await axios.get(archivoURL, { responseType: "arraybuffer" });
	const data = new Uint8Array(response.data);
	const workbook = XLSX.read(data, { type: "array" });
	const workbookSheets = workbook.SheetNames;
	const sheet = workbookSheets[0];
	let dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
	dataExcel = dataExcel.filter((objeto) => objeto.A);
	return dataExcel;
}

// Función para actualizar los precios y agregar la propiedad vigencia
export const updateDbPricesFromExcel = async () => {
	try {
		// URL del archivo de precios compartido en Google Drive
		const archivoExcelURL =
			"https://docs.google.com/spreadsheets/d/1yD7ab4z94jzcfOkeIjKrtvuVoJabq5foJzP0lIqGVtI/edit?usp=sharing";

		const dataExcel = await leerExcel(archivoExcelURL);

		const fechaActual = new Date().toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});

		// Actualiza el modelo Prices con la información del Excel
		let updates = 0;
		let noPrice = 0;
		let qNewModels = 0;
		let updatedModels = [];
		let newModels = [];
		let notification;

		// Procesa los registros de dataExcel omitiendo el encabezado
		for (let i = 1; i < dataExcel.length; i++) {
			const entrada = dataExcel[i];
			const modelo = entrada.B;
			//console.log(`Procesando registro del Excel:`, entrada);

			let precio = 0; // Valor predeterminado

			// Asegúrate de que entrada.C sea una cadena y elimina caracteres no numéricos
			if (typeof entrada.C === "string") {
				const precioStr = entrada.C.replace(/[^0-9]/g, ""); // Elimina cualquier carácter que no sea un número
				if (precioStr.trim() !== "") {
					precio = parseFloat(precioStr); // Convierte a número
				}
			} else if (typeof entrada.C === "number") {
				precio = entrada.C; // Si ya es un número, úsalo directamente
			}

			//console.log(`Modelo: ${modelo}, Precio procesado: ${precio}`); // Log del precio procesado

			const cilindradas = entrada.D ? entrada.D : "";
			const url = entrada.E ? entrada.E : "";
			const marca = entrada.A ? entrada.A : "";

			// Verifica si el precio es un número válido antes de actualizar el modelo
			if (!isNaN(precio) && precio > 0) {
				const vigencia = fechaActual;
				try {
					// Actualiza el precio, marca y la vigencia, o crea un nuevo documento si no existe. Tambien actualiza url  cilindradas si están en el excel
					const updatedPrice = await Prices.findOneAndUpdate(
						{ modelo: modelo },
						{ precio: precio, vigencia: vigencia, marca: marca },
						{ new: true, upsert: true, rawResult: true }
					);

					// Identifico los modelos nuevos
					if (updatedPrice.lastErrorObject.upserted) {
						console.log(
							"Se creó un nuevo registro con modelo:",
							updatedPrice.value.modelo
						);
						newModels.push(updatedPrice.value.modelo);
						qNewModels++;
					}

					// Identifico los modelos actualizados
					updatedModels.push({ modelo, precio });
					updates++;

					if (cilindradas !== "") {
						const updatedCC = await Prices.findOneAndUpdate(
							{ modelo: modelo },
							{ cilindradas: cilindradas }
						);
					}
					if (url !== "") {
						const updatedURL = await Prices.findOneAndUpdate(
							{ modelo: modelo },
							{ url: url }
						);
					}
				} catch (error) {
					console.error("Error al actualizar o crear el documento:", error);
				}
			} else {
				console.error("Precio no válido para el modelo:", modelo);
				noPrice = `${noPrice}, ${modelo}`;
			}
		}
		console.log(
			`Hay ${
				dataExcel.length - 1
			} registros en el Excel y se actualizaron ${updates} modelos. Faltó actualizar: ${noPrice}.`
		);

		// Busca y cambia isActive a false a los registros que están en la base pero no en el Excel
		try {
			// Crear una lista de modelos presentes en el Excel
			let modelosEnExcel = dataExcel.map((entrada) => entrada.B.trim());
			//console.log("Modelos en Excel (normalizados):", modelosEnExcel);

			// Primero, activo todos los modelos
			const resultActivation = await Prices.updateMany(
				{}, // Sin filtro para actualizar todos los documentos
				{ $set: { isActive: true } }
			);
			console.log(`Se activaron ${resultActivation.modifiedCount} modelos`);

			// Primero, obtengo todos los modelos activos
			const modelosActivos = await Prices.find({ isActive: true });
			console.log(
				"Modelos activos antes de actualizar:",
				modelosActivos.map((m) => m.modelo)
			);

			// Filtra los modelos que no están en el Excel
			const modelosADesactivar = modelosActivos.filter((modeloDB) => {
				return !modelosEnExcel.some(
					(modeloExcel) =>
						modeloExcel.toLowerCase() === modeloDB.modelo.toLowerCase()
				);
			});

			// Actualiza solo los modelos que no están en el Excel
			if (modelosADesactivar.length > 0) {
				const result = await Prices.updateMany(
					{
						modelo: {
							$in: modelosADesactivar.map((m) => m.modelo),
						},
					},
					{ $set: { isActive: false } }
				);
			}
		} catch (error) {
			console.error("Error al desactivar registros antiguos:", error);
		}

		// Busca los registros con isActive en false
		let registrosDesactivados;
		try {
			registrosDesactivados = await Prices.find({
				isActive: false,
			});
			//console.log("Registros desactivados:", registrosDesactivados);
		} catch (error) {
			console.error("Error al buscar registros desactivados:", error);
		}

		notification = `*🔔 NOTIFICACION de actualización de Precios:*\nHay ${
			dataExcel.length - 1
		} registros en el Excel y se actualizaron ${updates} modelos.\nFaltaron actualizar: ${noPrice} modelos.\nHay ${qNewModels} modelos nuevos: ${newModels.join(
			", "
		)}.\nModelos inactivos: ${registrosDesactivados.map(
			(modelo) => modelo.modelo
		).join(", ")}.\n\n*Megamoto*`;

		return notification;
	} catch (error) {
		const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		console.log("Error en updatesDbPricesFromExcel.js", errorMessage);
		throw errorMessage;
	}
};
