import axios from "axios"
import XLSX from "xlsx"; 
import path from "path";
import { fileURLToPath } from "url";
import { sendExcelByWhatsApp } from "../utils/sendExcelByWhatsApp.js";

export const callScrapper = async(userPhone)=>{

    try {
        const precios = await axios.get(
            "https://three-2-13-web-scrapping.onrender.com/scrape/mercado_libre"
        );
        console.log("Precios:", precios.data)
        
        const allProducts = precios.data
        const ws = XLSX.utils.json_to_sheet(allProducts); 
        const wb = XLSX.utils.book_new(); 
        XLSX.utils.book_append_sheet(wb, ws, "Productos"); 
        
        // Define a temporal file for the excel 
        const tempFilePath = "excel/productos.xlsx"
        XLSX.writeFile(wb, tempFilePath);

        // Obtain completa route for the temporal file
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const filePath = path.join(__dirname, "../", tempFilePath);

        sendExcelByWhatsApp(userPhone, filePath)      

    } catch (error) {
        console.log("Error en callScrapper:", error)
    }
}