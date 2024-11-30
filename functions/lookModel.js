import axios from "axios";
import { modelos } from "../excel/modelos.js";
import dotenv from "dotenv"
dotenv.config()

// Uses Hugging Face model to search for similarity 
const HUGGING_FACE_API_URL =
	"https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

const tokenHuggingFace = process.env.HUGGING_FACE_API_KEY
console.log("token hugging face:", tokenHuggingFace)

export const lookModel = async (allProducts) => {
	const results = []; // Array para acumular los resultados

	return Promise.all(
		allProducts.map(async (product) => {
			try {
				// Generar embeddings para los modelos y sus sinónimos
				const modelEmbeddings = await Promise.all(
					modelos.map(async (model) => {
						try {
							// Crear un array con el modelo y sus sinónimos
							const modelTexts = [model.modelo, ...model.sinonimos].filter(
								(text) => text && text !== ""
							);

							// Para obtener el embedding real, comparamos con todos los títulos
							const response = await axios.post(
								HUGGING_FACE_API_URL,
								{
									inputs: {
										source_sentence: product.titulo,
										sentences: modelTexts, // Comparamos con el modelo y sus sinónimos
									},
								},
								{
									headers: { Authorization: `Bearer ${tokenHuggingFace}` },
								}
							);
							//console.log(`Similitudes para "${model.modelo}":`, response.data);
							return {
								model,
								similarities: response.data,
								maxSimilarity: Math.max(...response.data), // Guardamos la máxima similitud encontrada
							};
						} catch (error) {
							console.error(
								`Error al obtener similitudes para el modelo "${model.modelo}":`,
								error.response ? error.response.data : error.message
							);
							return {
								model,
								similarities:
									"Límite diario de solicitudes alcanzado para Hugging Face",
								maxSimilarity: -1,
							};
						}
					})
				);

				let bestMatch = null;
				let highestSimilarity = -1;

				// Revisar las similitudes de cada modelo
				modelEmbeddings.forEach(({ model, maxSimilarity }) => {
					if (maxSimilarity > highestSimilarity) {
						highestSimilarity = maxSimilarity;
						bestMatch = model;
					}
				});

				console.log(
					`Mejor coincidencia para "${product.titulo}": ${bestMatch?.modelo} (similitud: ${highestSimilarity})`
				);
				// Desestructuramos el producto y creamos un nuevo objeto con el orden deseado
				const { titulo, precio, ...restProduct } = product;
				const response = {
					titulo,
					modelo: bestMatch
						? bestMatch.modelo
						: "Límite diario de Huggin Face alcanzado.",
					precio,
					...restProduct,
				};
				
				results.push(response); // Acumula el resultado en el array
				
				return response;
				
			} catch (error) {
				console.error(`Error procesando producto "${product.titulo}":`, error);
				return {
					...product,
					modelo: error.response ? error.response.data : error.message,
				};
			}
		})
	).then(() => results); // Devuelve el array de resultados al final	
};
