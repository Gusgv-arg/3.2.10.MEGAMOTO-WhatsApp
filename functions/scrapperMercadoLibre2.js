import axios from "axios"; // Agregar axios
import cheerio from "cheerio"; // Agregar cheerio
import XLSX from "xlsx"; 

export const scrapperMercadoLibre2 = async () => {
	
    const urls = [
		"https://motos.mercadolibre.com.ar/scooters/motomel/blitz-110/blitz110_KILOMETERS_0km-0km_NoIndex_True#applied_filter_id%3DKILOMETERS%26applied_filter_name%3DKil%C3%B3metros%26applied_filter_order%3D8%26applied_value_id%3D%5B0km-0km%5D%26applied_value_name%3D0+km%26applied_value_order%3D2%26applied_value_results%3D94%26is_custom%3Dfalse",
		"https://motos.mercadolibre.com.ar/naked/benelli/leoncino-500_ITEM*CONDITION_2230284_NoIndex_True#applied_filter_id%3DITEM_CONDITION%26applied_filter_name%3DCondici%C3%B3n%26applied_filter_order%3D9%26applied_value_id%3D2230284%26applied_value_name%3DNuevo%26applied_value_order%3D1%26applied_value_results%3D47%26is_custom%3Dfalse",
		"https://motos.mercadolibre.com.ar/naked/suzuki/ax-100/ax100_ITEM*CONDITION_2230284_NoIndex_True#applied_filter_id%3DITEM_CONDITION%26applied_filter_name%3DCondici%C3%B3n%26applied_filter_order%3D6%26applied_value_id%3D2230284%26applied_value_name%3DNuevo%26applied_value_order%3D1%26applied_value_results%3D44%26is_custom%3Dfalse",
		"https://motos.mercadolibre.com.ar/scooters/motomel/strato-150_ITEM*CONDITION_2230284_NoIndex_True#applied_filter_id%3DITEM_CONDITION%26applied_filter_name%3DCondici%C3%B3n%26applied_filter_order%3D8%26applied_value_id%3D2230284%26applied_value_name%3DNuevo%26applied_value_order%3D1%26applied_value_results%3D40%26is_custom%3Dfalse"
	];

	let allProducts = [];

	for (const url of urls) {
		// Realiza la solicitud HTTP a la URL
		const { data } = await axios.get(url);
		const $ = cheerio.load(data); // Cargar el HTML en cheerio

		// Verifica si los resultados están presentes
		const resultadosDisponibles = $("ol.ui-search-layout");
		if (resultadosDisponibles.length === 0) {
			console.error("No se encontró el contenedor de resultados. Verifique el selector o la conexión.");
			continue; // Salta a la siguiente URL
		}

		// Realiza el scraping de cada aviso
		const products = $("ol.ui-search-layout.ui-search-layout--grid > li.ui-search-layout__item").map((i, el) => {
			const titulo = $(el).find("h2.poly-component__title > a").text() || "Título no disponible";
			const precio = $(el).find(".poly-component__price .andes-money-amount__fraction").text() || "Precio no disponible";
			const link = $(el).find("h2.poly-component__title > a").attr("href") || "Link no disponible";
			const ubicacion = $(el).find(".poly-component__location").text() || "Ubicación no disponible";
			const vendedor = $(el).find(".poly-component__seller").text() || "Vendedor no disponible";
			const atributos = $(el).find(".poly-component__attributes-list .poly-attributes-list__item").map((i, attr) => $(attr).text()).get() || [];

			// Filtra solo los resultados que contengan "0 Km" en sus atributos
			const esNuevo = atributos.filter(attr => attr.trim() === "2024, 0 Km");

			if (titulo && precio && link && esNuevo.length > 0) {
				return {
					titulo,
					precio,
					link,
					ubicacion,
					vendedor,
					atributos: atributos.join(", "),
				};
			}
		}).get();

		allProducts = allProducts.concat(products); 
	}

	// Exportar a Excel ...
    if (allProducts.length > 0) {
		console.log("Datos extraídos:", allProducts);
		console.log("Cantidad:", allProducts.length);
		// Exportar a Excel
		const ws = XLSX.utils.json_to_sheet(allProducts); 
		const wb = XLSX.utils.book_new(); 
		XLSX.utils.book_append_sheet(wb, ws, "Productos"); 
		XLSX.writeFile(wb, "productos.xlsx");
       	console.log("Datos exportados a productos.xlsx y return del array allProducts");
        return allProducts
	} else {
		console.warn(
			"No se encontraron datos para extraer. Verifique los selectores o los resultados de la búsqueda."
		);
	}

}