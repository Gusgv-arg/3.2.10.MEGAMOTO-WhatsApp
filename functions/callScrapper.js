import axios from "axios"
import XLSX from "xlsx"; 
import path from "path";
import { fileURLToPath } from "url";
import { sendExcelByWhatsApp } from "../utils/sendExcelByWhatsApp.js";
import { convertArrayToText } from "../utils/convertArrayToText.js";
import { marketAnalisisWithAssistant } from "../utils/marketAnalisisWithAssistant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const callScrapper = async(userPhone)=>{

    try {
        // Uses other API as a microservice for scrapping
        const precios = await axios.get("https://three-2-13-web-scrapping.onrender.com/scrape/mercado_libre");
        //console.log("Precios:", precios.data)
        
        const allProducts = precios.data
        
        // Transform the array in a txt file 
        const txtData = convertArrayToText(allProducts)
        console.log("TxtData:", txtData)

        // Send the txt file to the Assistant specialized GPT
        const gptAnalisis = marketAnalisisWithAssistant(txtData) 
        
        // Add gptAnalisis to excel file
        const gptDataArray = gptAnalisis.split('\n').map(line => ({ Analysis: line })); // Convertir a array de objetos
        const gptWs = XLSX.utils.json_to_sheet(gptDataArray); // Crear hoja de trabajo para GPT Analisis
        
        // Create an excel file with 2 sheets
        const ws = XLSX.utils.json_to_sheet(allProducts); 
        const wb = XLSX.utils.book_new(); 
        XLSX.utils.book_append_sheet(wb, ws, "Productos"); 
        XLSX.utils.book_append_sheet(wb, gptWs, "GPT Analisis", 0); // Agregar la hoja al principio
        
        // Define a temporal file for the excel 
		const tempFilePath = path.join(__dirname, "../public/productos.xlsx")
        XLSX.writeFile(wb, tempFilePath);
        
        // Obtain complete route for the temporal file
		const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/productos.xlsx`;
        console.log("FileUrl:", fileUrl)

        // Send the excel to the admin
        await sendExcelByWhatsApp(userPhone, fileUrl)
        
    } catch (error) {
        console.log("Error en callScrapper:", error.message)
    }
}
//callScrapper("5491161405589")