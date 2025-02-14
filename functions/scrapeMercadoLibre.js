import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";
import { lookModelWithEmbedding } from "./lookModelWithEmbedding.js";
//import { allProducts } from "../excel/allproducts.js"; // array para hacer pruebas hardcodeado
import { sendExcelByWhatsApp } from "../utils/excel/sendExcelByWhatsApp.js";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scrapeMercadoLibre = async (userPhone) => {
	try {
		// Advises Admin of the task
		const task =
			"🔔 *NOTIFICACION:*\nSe envió tu solicitud a otra API que busca en Mercado Libre todas las publicaciones de los modelos que vende Megamoto. Es un proceso que tarda.\n¡Paciencia!";
		await adminWhatsAppNotification(userPhone, task);

		// Uses other API as a microservice for scrapping
		const precios = await axios.get(
			"https://three-2-13-web-scrapping.onrender.com/scrape/mercado_libre"
		);

		// Advises Admin that data was received
		if (precios.data && precios.data.length > 0) {
			console.log(
				`Se recibieron ${precios.data.length} precios de Mercado Libre!! Ejemplo primer registro:`,
				precios.data[0]
			);
			const message = `🔔 *NOTIFICACION:*\nSe recibieron ${precios.data.length} avisos de Mercado Libre. Ahora falta identificar a que modelo corresponde cada aviso y generar el Excel.\n¡Falta menos!`;
			await adminWhatsAppNotification(userPhone, message);
		} else {
			// Si no se reciben datos, lanzar un error
			console.log("Hubo un error en el Scrapin:", precios.data);
			throw new Error(
				"El array de precios vino vacío; por lo que seguramente Mercado Libre cambió la estructura de la página y haya que modificar la API de scrapin."
			);
		}

		const allProducts = precios.data;

		let correctModels;
		try {
			correctModels = await lookModelWithEmbedding(allProducts);
			console.log(
				`CorrectModels: ${correctModels.length} registros - Ejemplo 1 registro: ${correctModels[0]}`
			);
		} catch (error) {
			console.log("Error en lookModelWithEmbedding.js", error.message);
		}

		// Convertir precios a números
		if (correctModels && correctModels.length > 0) {
			// Verificar que correctModels no sea undefined
			correctModels.forEach((model) => {
				if (model.precio) {
					// Verificar si model.precio está definido
					model.precio = parseFloat(
						model.precio.replace(/\./g, "").replace(",", ".")
					);
				} else {
					console.warn(`Precio no definido para el modelo: ${model.modelo}`);
				}
			});
		} else {
			console.warn("No se encontraron modelos correctos.");
		}

		//console.log("correctModels:", correctModels)

		const templatePath =
			"https://raw.githubusercontent.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/main/public/precios_template14_02_2025.xlsx";

		const outputPath = path.join(
			__dirname,
			"../public/precios_mercado_libre.xlsx"
		);

		// Cargar el archivo predefinido
		const workbook = new ExcelJS.Workbook();
		try {
			// Fetch the template file using axios first
			const response = await axios.get(templatePath, {
				responseType: "arraybuffer",
			});
			//console.log("response.data:", response.data)

			await workbook.xlsx.load(response.data);
			//console.log("Template file loaded successfully");
		} catch (error) {
			console.log("Error al acceder a precios_template.xlsx", error.message);
			const errorMessage =
				"No se pudo cargar el archivo de plantilla. Verifica la URL y el acceso.";
			adminWhatsAppNotification(userPhone, errorMessage);
		}

		// Seleccionar la hoja "Avisos"
		const avisosSheet = workbook.getWorksheet("Avisos");
		//console.log("Contenido de la hoja 'Avisos':", avisosSheet.getSheetValues());

		if (!avisosSheet) {
			throw new Error("La hoja 'Avisos' no existe en el archivo predefinido.");
		}

		// Limpiar el contenido anterior (manteniendo encabezados)
		const rowCount = avisosSheet.rowCount;
		for (let i = rowCount; i > 1; i--) {
			// Comenzar desde la última fila y eliminar hacia arriba
			avisosSheet.spliceRows(i, 1);
		}
		console.log("correctModels antes del addRows:", correctModels);

		// Añadir los nuevos datos a la hoja "Avisos"
		if (correctModels && correctModels.length > 0) {
			// Asegúrate de que los datos se están formateando correctamente
			const rowsToAdd = correctModels.map((model) => [
				model.titulo,
				model.modelo,
				model.precio,
				model.link,
				model.ubicacion,
				model.vendedor,
				model.atributos,
			]);

			console.log("Filas a agregar antes del proceso:", rowsToAdd);
			console.log("Tamaño rowsToAdd:", rowsToAdd.length);
			// Verifica que rowsToAdd no esté vacío antes de agregar
			if (rowsToAdd.length > 0) {
				try {
					avisosSheet.addRows(rowsToAdd);
				} catch (error) {
					console.error("Error al agregar filas a la hoja 'Avisos':", error);
				}
			} else {
				console.warn("No hay datos para agregar a la hoja 'Avisos'.");
			}
			console.log("Número de filas en la hoja 'Avisos' después de agregar:", avisosSheet.rowCount);
		} else {
			console.warn("No se encontraron modelos correctos.");
		}

		// Guardar el archivo actualizado en una ubicación pública
		await workbook.xlsx.writeFile(outputPath);
		//console.log("Archivo actualizado guardado en:", outputPath);

		// Generar la URL pública del archivo
		const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/precios_mercado_libre.xlsx`;
		//console.log("Archivo disponible en:", fileUrl);

		// Enviar el archivo Excel por WhatsApp (opcional)
		const fileName = "Precios Mercado Libre";
		await sendExcelByWhatsApp(userPhone, fileUrl, fileName);
	} catch (error) {
		console.log("Error en scrapeMercadoLibre.js:", error);
		let errorMessage;
		if (error.response && error.response.data && error.response.data.error) {
			// Si hay una respuesta de la API, usar el mensaje de error de la respuesta
			errorMessage = `🔔 *NOTIFICACION DE ERROR:*\nError en la API de Scraping: ${error.response.data.error}`;
		} else if (
			error.message === "Request failed with status code 502" ||
			error.message === "Request failed with status code 503" ||
			error === "AxiosError: Request failed with status code 503"
		) {
			// Manejo específico para el error 502
			errorMessage = `🔔 *NOTIFICACION DE ERROR:*\nHay un problema momentáneo en Render que es donde está hosteado el Servidor. Puedes intentar nuevamente o esperar una hora.`;
		} else {
			// Si no hay respuesta, usar el mensaje de error general
			errorMessage = `🔔 *NOTIFICACION DE ERROR:*\nHubo un error en la solicitud: ${error}`;
		}

		// Notificar al administrador
		adminWhatsAppNotification(userPhone, errorMessage);
	}
};
//scrapeMercadoLibre()
