import axios from "axios";
import ExcelJS from "exceljs";
import { fileURLToPath } from "url";
import path from "path";
import { sendExcelByWhatsApp } from "../utils/excel/sendExcelByWhatsApp.js";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scrapeFacebook = async (userPhone) => {
	try {
		// Uses other API as a microservice for scrapping
		const ads = await axios.get(
			"https://three-2-13-web-scrapping.onrender.com/scrape/facebook"
		);
		console.log("Avisos:", ads.data);

		const results = ads.data;

		// Crear un nuevo libro de Excel
		const workbook = new ExcelJS.Workbook();

		const worksheets = {}; // Objeto para rastrear los worksheets creados

		// Inicializar la fila donde comenzaremos a agregar resultados
		let startRow = 1;

		// Iterar sobre los nombres agrupados
		for (const ad of results) {
			const name = ad.name;
			const group = [ad]; // Agrupar el anuncio en un array

			// Verificar si ya existe un worksheet para este nombre
			let worksheet;
			if (!worksheets[name]) {
				// Crear una nueva hoja con el nombre del anunciante
				worksheet = workbook.addWorksheet(name);
				worksheets[name] = worksheet; // Guardar el worksheet en el objeto
				startRow = 1; // Reiniciar la fila para un nuevo worksheet
			} else {
				worksheet = worksheets[name]; // Usar el worksheet existente
			}

			// Inicializar la fila para este grupo
			let currentRow = startRow;

			for (const result of group) {
				const { text, images, extraTexts } = result;

				// Agregar el texto a la celda correspondiente
				worksheet.getCell(`A${currentRow}`).value = "AVISO:" + text; //currentRow = 1

				// Contar la cantidad de imágenes y cards
				const imageCount = images ? images.length : 0;

				// Agregar la cantidad de avisos debajo del texto
				currentRow += 1; // currentRow = 2
				worksheet.getCell(
					`A${currentRow}`
				).value = `Cantidad de avisos: ${imageCount}`;

				// Ajustar el tamaño de las celdas para las imágenes
				worksheet.getColumn(1).width = 40;
				worksheet.getColumn(2).width = 5;
				worksheet.getColumn(3).width = 40;
				worksheet.getColumn(4).width = 5;
				worksheet.getColumn(5).width = 40;

				let video;
				// Agregar imágenes de "images"
				if (imageCount > 0) {
					for (let i = 0; i < imageCount; i++) {
						const imageUrl = images[i]?.originalImageUrl
							? images[i].originalImageUrl
							: images[i].videoPreviewImageUrl;
						video = images[i].videoPreviewImageUrl ? "Video. " : "";

						// Descargar la imagen y agregarla a la hoja
						const response = await fetch(imageUrl);
						if (!response.ok)
							throw new Error(`Error al descargar la imagen: ${imageUrl}`);
						const arrayBuffer = await response.arrayBuffer();
						const buffer = Buffer.from(arrayBuffer); // Convertir a Buffer
						const imageId = workbook.addImage({
							buffer,
							type: "picture",
							extension: "png",
						});

						// Calcular la fila y columna para la imagen
						const row = currentRow; // row y currentRow son = 2
						const col = (i % 3) * 2;

						// Agregar la imagen a la celda correspondiente
						worksheet.addImage(imageId, {
							tl: { col: col, row: row },
							br: { col: col + 1, row: row + 1 },
							editAs: "oneCell",
						});

						// Ajustar la altura de la fila para que se muestre la imagen
						worksheet.getRow(row + 1).height = 400; // row + 1 = 3

						// Incrementar 2 filas después de cada 3 imágenes
						if ((i + 1) % 3 === 0) {
							currentRow += 2; // currentRow + 2 = 4 (despues de la primer fila)
						}

						// Asegurarse de que haya una fila vacía después de las imágenes
						if (i === imageCount - 1) {
							currentRow += 3; // Incrementar para dejar una fila vacía después
						}
					}

					// Agregar textos de extraTexts debajo de las imágenes
					if (extraTexts && extraTexts.length > 0) {
						const extraTextRow = currentRow;
						const concatenatedTexts = extraTexts
							.map((extra) => extra.text)
							.join("\n");
						const extraTextCell = worksheet.getCell(`A${extraTextRow}`);
						extraTextCell.value = video + concatenatedTexts; // Agregar texto concatenado
						extraTextCell.alignment = { wrapText: true }; // Ajustar texto en la celda

						// Ajustar la altura de la fila para que se muestre el texto completo
						const lineCount = concatenatedTexts.split("\n").length; // Contar líneas
						worksheet.getRow(extraTextRow).height = lineCount * 30;
						currentRow += 2; // se incrementa currentRow
					}
					// Actualizar la fila de inicio para el siguiente grupo
					startRow = currentRow;
				}
			}
		}

		// Define a temporal file for the excel
		const tempFilePath = path.join(__dirname, "../public/Avisos_Facebook.xlsx");

		// Obtain complete route for the temporal file
		const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/Avisos_Facebook.xlsx`;
		console.log("FileUrl:", fileUrl);

		// Guardar el archivo de Excel
		await workbook.xlsx.writeFile(tempFilePath);
		console.log("tempFilePath:", tempFilePath);
		console.log(`Archivo de Excel creado en: ${fileUrl}`);

		// Send the excel to the admin
		const fileName = "Avisos_Facebook";
		await sendExcelByWhatsApp(userPhone, fileUrl, fileName);
	} catch (error) {
		console.log("Error in scrapeFacebook.js:", error.message);
		const errorMessage = `*NOTIFICACION DE ERROR:*\nEn el proceso de scrapping de Facebook hubo un error: ${error.message}`;
		adminWhatsAppNotification(userPhone, errorMessage);
	}
};
