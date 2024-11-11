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
        const precios = await axios.get("https://three-2-13-web-scrapping.onrender.com/scrape/mercado_libre");
        //console.log("Precios:", precios.data)
        /* const allProducts = [{
            titulo: 'Benelli Leoncino Trail 500 Consulte Precio Cdo',
            precio: '13.000.000',
            link: 'https://moto.mercadolibre.com.ar/MLA-1438313489-benelli-leoncino-trail-500-consulte-precio-cdo-_JM#polycard_client=search-nordic&position=47&search_layout=grid&type=item&tracking_id=7edc41f5-7ad8-4eca-843e-5181596935db',
            ubicacion: 'Iriondo - Santa Fe',
            vendedor: 'Vendedor no disponible',
            atributos: '2024, 0 Km'
          },
          {
            titulo: 'Benelli Leoncino 500',
            precio: '15.212.960',
            link: 'https://moto.mercadolibre.com.ar/MLA-1444082205-benelli-leoncino-500-_JM#polycard_client=search-nordic&position=48&search_layout=grid&type=item&tracking_id=7edc41f5-7ad8-4eca-843e-5181596935db',
            ubicacion: 'Escalante - Chubut',
            vendedor: 'Vendedor no disponible',
            atributos: '2024, 0 Km'
          }
        ] */
        const allProducts = precios.data
        const ws = XLSX.utils.json_to_sheet(allProducts); 
        const wb = XLSX.utils.book_new(); 
        XLSX.utils.book_append_sheet(wb, ws, "Productos"); 
        
        // Define a temporal file for the excel 
		const tempFilePath = path.join(__dirname, "../public/productos.xlsx")
        XLSX.writeFile(wb, tempFilePath);
        
        // Obtain complet route for the temporal file
		const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/productos.xlsx`;
        console.log("FileUrl:", fileUrl)
        sendExcelByWhatsApp(userPhone, fileUrl)      

    } catch (error) {
        console.log("Error en callScrapper:", error.message)
    }
}
//callScrapper("5491161405589")