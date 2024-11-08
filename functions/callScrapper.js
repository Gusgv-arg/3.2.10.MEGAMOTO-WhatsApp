import axios from "axios"
import XLSX from "xlsx"; 

export const callScrapper = async()=>{

    try {
        const precios = await axios.get(
            "https://three-2-13-web-scrapping.onrender.com/scrape/mercado_libre"
        );
        console.log("Precios:", precios.data)
        
        const allProducts = precios.data
        const ws = XLSX.utils.json_to_sheet(allProducts); 
        const wb = XLSX.utils.book_new(); 
        XLSX.utils.book_append_sheet(wb, ws, "Productos"); 
        XLSX.writeFile(wb, "excel/productos.xlsx");
        
        return allProducts
    } catch (error) {
        console.log("Error en callScrapper:", error)
    }
}