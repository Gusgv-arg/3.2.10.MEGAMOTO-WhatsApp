import { modelos } from "../excel/modelos.js";
//import { allProducts } from "../excel/allproducts.js"; // Para hacer pruebas harcodeadas

// Función para limpiar texto
const cleanText = (text) => {
    return text.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Eliminar caracteres especiales, excepto guiones
        .replace(/\s+/g, " ") // Reemplazar múltiples espacios por uno solo
        .trim(); // Eliminar espacios al inicio y al final
};

// Función para limpiar y normalizar texto
const normalizeText = (text) => {
    return text.toLowerCase()
        .replace(/[-\s]+/g, " ") // Reemplazar guiones y múltiples espacios por uno solo
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Eliminar caracteres especiales
        .trim(); // Eliminar espacios al inicio y al final
};

// Función para convertir texto a vector
const textToVector = (text) => {
    const words = text.split(" ");
    const wordFreq = {};
    words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    return wordFreq;
};

// Función para calcular similitud de coseno
const calculateSimilarity = (vec1, vec2) => {
    const allWords = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    allWords.forEach((word) => {
        const val1 = vec1[word] || 0;
        const val2 = vec2[word] || 0;
        dotProduct += val1 * val2;
        mag1 += val1 * val1;
        mag2 += val2 * val2;
    });

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;

    return dotProduct / (mag1 * mag2);
};

// Función para verificar si un texto es una subcadena de otro
const isSubstring = (shorter, longer) => {
    return longer.includes(shorter);
};

// Función principal para buscar modelos
export const lookModelWithEmbedding = async (allProducts) => {
    const results = [];

    allProducts.forEach(product => {
        try {
            const productTitle = normalizeText(product.titulo);
            let bestMatches = [];
            let highestSimilarity = -1;

            // Usar similitud de coseno para todos los modelos y sinónimos
            modelos.forEach(model => {
                const modelTexts = [model.modelo, ...model.sinonimos].filter(text => text && text !== "");
                
                modelTexts.forEach(modelText => {
                    const cleanModelText = normalizeText(modelText);
                    const productVector = textToVector(productTitle);
                    const modelVector = textToVector(cleanModelText);
                    const similarity = calculateSimilarity(productVector, modelVector);

                    if (similarity > highestSimilarity) {
                        bestMatches = [{ model: model.modelo, similarity }];
                        highestSimilarity = similarity;
                    } else if (similarity === highestSimilarity) {
                        bestMatches.push({ model: model.modelo, similarity });
                    }
                });
            });

            // Seleccionar el mejor match basado en la similitud más alta
            if (bestMatches.length > 0 && highestSimilarity > 0.5) {
                // Ordenar por similitud
                bestMatches.sort((a, b) => b.similarity - a.similarity);
                const bestMatch = bestMatches[0];
                results.push({
                    ...product, // Mantener todas las propiedades del producto
                    modelo: bestMatch.model // Agregar solo el nombre del modelo correspondiente
                });
            }

        } catch (error) {
            console.error(`Error procesando producto: ${product.titulo}`, error);
        }
    });

    results.sort((a, b) => b.similitud - a.similitud);
    console.log("Results - ejemplo del primer registro:", results[0]);
    return results;
};

// Llamada a la función
//lookModel(allProducts);