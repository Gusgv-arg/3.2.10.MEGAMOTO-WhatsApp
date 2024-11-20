import axios from "axios"

export const scrapeFacebook = async(userPhone)=>{

    try {
        // Uses other API as a microservice for scrapping
        const precios = await axios.get("https://three-2-13-web-scrapping.onrender.com/scrape/facebook");
        console.log("Precios:", precios.data)
       
    } catch (error) {
        console.log("error in scrapeFacebook.js:", error.message)
    }
}