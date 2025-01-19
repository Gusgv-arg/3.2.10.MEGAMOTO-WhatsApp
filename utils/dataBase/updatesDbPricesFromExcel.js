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

		// Procesa los registros de dataExcel omitiendo el encabezado
		for (let i = 1; i < dataExcel.length; i++) {
			const entrada = dataExcel[i];
			const modelo = entrada.B;
			let precio = 0; // Valor predeterminado
			const precioStr =
				typeof entrada.C === "string" ? entrada.C.replace(/\./g, "") : ""; // Elimina puntos solo si es una cadena

			if (!isNaN(precioStr) && precioStr.trim() !== "") {
				precio = Math.round(parseFloat(precioStr)); // Convierte a número si es válido
			}
			const cilindradas = entrada.D ? entrada.D : "";
			const url = entrada.E ? entrada.E : "";

			// Verifica si el precio es un número válido antes de actualizar el modelo
			if (!isNaN(precio)) {
				const vigencia = fechaActual;
				try {
					// Actualiza el precio y la vigencia, o crea un nuevo documento si no existe. Tambien actualiza url  cilindradas si están en el excel
					const updatedPrice = await Prices.findOneAndUpdate(
						{ modelo: modelo },
						{ precio: precio, vigencia: vigencia },
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
				(noPrice = noPrice + " "), +modelo;
			}
		}
		console.log(
			`Hay ${
				dataExcel.length - 1
			} registros en el Excel y se actualizaron ${updates} modelos. Faltó actualizar: ${noPrice}.`
		);
		
		// Crear una lista de modelos presentes en el Excel
		let modelosEnExcel = dataExcel.map((entrada) => entrada.B);
		
		// Busca y cambia isActive false a los registros que están en la base pero no en el Excel
		try {
			await Prices.updateMany(
				{ modelo: { $nin: modelosEnExcel } },
				{ $set: { isActive: false } }
			);
		} catch (error) {
			console.error("Error al desactivar registros antiguos:", error);
		}
		
		// Busca los registros con isActive en false
		let registrosDesactivados;
		try {
			registrosDesactivados = await Prices.find({
				isActive: false,
			});
			console.log("Registros desactivados:", registrosDesactivados);
		} catch (error) {
			console.error("Error al buscar registros desactivados:", error);
		}
		
		const notification =
			`*NOTIFICACION de actualización de Precios:*\nHay ${
				dataExcel.length - 1
			} registros en el Excel y se actualizaron ${updates} modelos. Faltó actualizar: ${noPrice}.`
		;
		return notification

	} catch (error) {
		console.log("Error en updatesDbPricesFromExcel", error.message);
		throw error.message;
	}
};
