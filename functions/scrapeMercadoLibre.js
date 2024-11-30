import axios from "axios"
import path from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";
import { lookModel } from "./lookModel.js";
// import { allProducts } from "../excel/allproducts.js"; // array para hacer pruebas hardcodeado
import { sendExcelByWhatsApp } from "../utils/sendExcelByWhatsApp.js";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scrapeMercadoLibre = async (userPhone) => {
	try {
		// Uses other API as a microservice for scrapping
		const precios = await axios.get(
			"https://three-2-13-web-scrapping.onrender.com/scrape/mercado_libre"
		);
		if (precios.data){
			console.log("Se recibieron precios de Mercado Libre!!");
		}

		const allProducts = precios.data;

		try {
			const correctModels = await lookModel(allProducts);
			console.log("Se buscaron los modelos de los avisos")
		} catch (error) {
			console.log("Error  en lookModel.js", error.message)
		}

		// Convertir precios a números
		correctModels.forEach((model) => {
			model.precio = parseFloat(
				model.precio.replace(/\./g, "").replace(",", ".")
			);
		});

		//console.log("correctModels:", correctModels)
		// Ruta del archivo Excel predefinido y la ruta para guardar el archivo actualizado
		/* const templatePath = path.join(
			__dirname,
			"../public/precios_template.xlsx"
		); */

		const templatePath="https://raw.githubusercontent.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/main/public/precios_template.xlsx"
		const outputPath = path.join(
			__dirname,
			"../public/precios_mercado_libre.xlsx"
		);
		
		// Cargar el archivo predefinido
		const workbook = new ExcelJS.Workbook();
		try {
			await workbook.xlsx.readFile(templatePath);
			
		} catch (error) {
			console.log("Error al acceder a precios_template.xlsx", error.message)
			const errorMessage = "No se pudo cargar el archivo de plantilla. Verifica la URL y el acceso.";
			adminWhatsAppNotification(userPhone, errorMessage);
		}

		// Seleccionar la hoja "Avisos"
		const avisosSheet = workbook.getWorksheet("Avisos");

		if (!avisosSheet) {
			throw new Error("La hoja 'Avisos' no existe en el archivo predefinido.");
		}

		// Limpiar el contenido anterior (manteniendo encabezados)
		const rowCount = avisosSheet.rowCount;
		for (let i = rowCount; i > 1; i--) {
			// Comenzar desde la última fila y eliminar hacia arriba
			avisosSheet.spliceRows(i, 1);
		}

		// Añadir los nuevos datos a la hoja "Avisos"
		avisosSheet.addRows(
			correctModels.map((model) => [
				model.titulo,
				model.modelo,
				model.precio,
				model.link,
				model.ubicacion,
				model.vendedor,
				model.atributos,
			])
		);

		// Guardar el archivo actualizado en una ubicación pública
		await workbook.xlsx.writeFile(outputPath);
		console.log("Archivo actualizado guardado en:", outputPath);

		// Generar la URL pública del archivo
		const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/precios_mercado_libre.xlsx`;
		console.log("Archivo disponible en:", fileUrl);

		// Enviar el archivo Excel por WhatsApp (opcional)
		const fileName = "Precios_Actualizados";
		await sendExcelByWhatsApp(userPhone, fileUrl, fileName);

	} catch (error) {
		console.log("Error en scrapeMercadoLibre.js:", error.message);
		let errorMessage = `*NOTIFICACION DE ERROR:*\nEn el proceso de scraping de Mercado Libre hubo un error: ${error.message}`;
		if (error.message === "Request failed with status code 502"){
			errorMessage = `*NOTIFICACION DE ERROR:*\nHay un problema momentáneo en Render que es donde está hosteado el Servidor. Podes intentar nuevamente o esperar una hora.`
		}
		// Notificar al administrador
		adminWhatsAppNotification(userPhone, errorMessage);
	}
};


