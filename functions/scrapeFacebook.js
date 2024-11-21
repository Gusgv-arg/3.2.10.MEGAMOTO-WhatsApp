import axios from "axios";
import ExcelJS from "exceljs";
import { fileURLToPath } from "url";
import path from "path";
import { sendExcelByWhatsApp } from "../utils/sendExcelByWhatsApp.js";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scrapeFacebook = async (userPhone) => {
	try {
		// Uses other API as a microservice for scrapping
		const ads = await axios.get("https://three-2-13-web-scrapping.onrender.com/scrape/facebook");
		console.log("Avisos:", ads.data)

		const results = ads.data
		
		// Crear un nuevo libro de Excel
		const workbook = new ExcelJS.Workbook();

		// Inicializar la fila donde comenzaremos a agregar resultados
		let startRow = 1;

		// Iterar sobre los nombres agrupados
		for (const ad of results) {
			const name = ad.name; 
			const group = [ad]; // Agrupar el anuncio en un array

			// Crear una nueva hoja con el nombre del anunciante
			const worksheet = workbook.addWorksheet(name);

			// Inicializar la fila para este grupo
			startRow = 1;

			for (const result of group) {
				const { text, images, extraTexts } = result;

				// Agregar el texto a la celda correspondiente
				worksheet.getCell(`A${startRow}`).value = text;

				// Contar la cantidad de imágenes y cards
				const imageCount = images ? images.length : 0;

				// Agregar la cantidad de avisos debajo del texto
				worksheet.getCell(
					`A${startRow + 1}`
				).value = `Cantidad de avisos: ${imageCount}`;

				// Ajustar el tamaño de las celdas para las imágenes
				worksheet.getColumn(1).width = 40;
				worksheet.getColumn(2).width = 5;
				worksheet.getColumn(3).width = 40;
				worksheet.getColumn(4).width = 5;
				worksheet.getColumn(5).width = 40;

				// Agregar imágenes de "images"
				if (imageCount > 0) {
					for (let i = 0; i < imageCount; i++) {
						const imageUrl = images[i]?.originalImageUrl ? images[i].originalImageUrl : images[i].videoPreviewImageUrl;

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
						const row = startRow + 1;
						const col = (i * 2) % 6; // Columna 0, 2, 4 para las imágenes

						// Agregar la imagen a la celda correspondiente
						worksheet.addImage(imageId, {
							tl: { col: col, row: row },
							br: { col: col + 1, row: row + 1 },
							editAs: "oneCell",
						});

						// Ajustar la altura de la fila para que se muestre la imagen
						worksheet.getRow(row + 1).height = 400;

						// Incrementar la fila después de cada 3 imágenes
						if ((i + 1) % 3 === 0) {
							startRow += 2;
						}
						// Ajustar la altura de la fila vacía debajo de las imágenes
						worksheet.getRow(row + 2).height = 15;
					}
					// Agregar textos de extraTexts debajo de las imágenes
					if (extraTexts && extraTexts.length > 0) {
						const extraTextRow = startRow + 1; // Fila para los textos extra
						const concatenatedTexts = extraTexts.map(extra => extra.text).join('\n'); // Concatenar textos
						worksheet.getCell(`A${extraTextRow}`).value = concatenatedTexts; // Agregar texto concatenado
					}
				}

				// Incrementar la fila de inicio para el siguiente aviso
				startRow += Math.ceil(imageCount / 3) * 2;
			}
		}

		// Define a temporal file for the excel
		const tempFilePath = path.join(__dirname, "../public/Avisos_Facebook.xlsx");
		
        // Obtain complete route for the temporal file
		const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/Avisos_Facebook.xlsx`;
        console.log("FileUrl:", fileUrl)

		// Guardar el archivo de Excel
		await workbook.xlsx.writeFile(tempFilePath);
        console.log("tempFilePath:", tempFilePath)
		console.log(`Archivo de Excel creado en: ${fileUrl}`);
		
        // Send the excel to the admin
        const fileName = "Avisos_Facebook"
        await sendExcelByWhatsApp(userPhone, fileUrl, fileName)
        
	} catch (error) {
		console.log("Error in scrapeFacebook.js:", error.message);
		const errorMessage = `*NOTIFICACION DE ERROR:*\nEn el proceso de scrapping de Facebook hubo un error: ${error.message}`
        adminWhatsAppNotification(userPhone, errorMessage)
    
	}
};

