import axios from "axios"
import XLSX from "xlsx"; 
import path from "path";
import { fileURLToPath } from "url";
import { sendExcelByWhatsApp } from "../utils/sendExcelByWhatsApp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const callScrapper = async(userPhone)=>{

    try {
        // Uses other API as a microservice for scrapping
        const precios = await axios.get(
            "https://three-2-13-web-scrapping.onrender.com/scrape/mercado_libre"
        );
        //console.log("Precios:", precios.data)
        
        const allProducts = precios.data
        const ws = XLSX.utils.json_to_sheet(allProducts); 
        const wb = XLSX.utils.book_new(); 
        XLSX.utils.book_append_sheet(wb, ws, "Productos"); 
        
        // Define a temporal file for the excel 
		const tempFilePath = path.join(__dirname, "../public/productos.xlsx")
        XLSX.writeFile(wb, tempFilePath);
        console.log("tempFilePath", tempFilePath)

        // Obtain complet route for the temporal file
		const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/productos.xlsx`
        console.log("FileUrl:", fileUrl)
        sendExcelByWhatsApp(userPhone, fileUrl)      

    } catch (error) {
        console.log("Error en callScrapper:", error.message)
    }
}
//callScrapper("5491161405589")