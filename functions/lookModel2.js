import { modelos } from "../excel/modelos.js";

// Own function created to search models with embeddings

export const lookModel = async (allProducts) => {
    const results = [];

    // Función para convertir texto a vector (embedding simple)
    const textToVector = (text) => {
        // Convertir a minúsculas y eliminar caracteres especiales
        const cleanText = text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .replace(/\s+/g, " ")
            .trim();
        
        // Dividir en palabras
        const words = cleanText.split(" ");
        
        // Crear un diccionario de frecuencias
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        return wordFreq;
    };

    // Función para calcular similitud de coseno
    const calculateSimilarity = (vec1, vec2) => {
        // Obtener todas las palabras únicas
        const allWords = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
        
        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;
        
        // Calcular producto punto y magnitudes
        allWords.forEach(word => {
            const val1 = vec1[word] || 0;
            const val2 = vec2[word] || 0;
            dotProduct += val1 * val2;
            mag1 += val1 * val1;
            mag2 += val2 * val2;
        });
        
        mag1 = Math.sqrt(mag1);
        mag2 = Math.sqrt(mag2);
        
        // Evitar división por cero
        if (mag1 === 0 || mag2 === 0) return 0;
        
        return dotProduct / (mag1 * mag2);
    };

    // Procesar cada producto
    allProducts.forEach(product => {
        try {
            // Convertir el título del producto a vector
            const productVector = textToVector(product.titulo);
            
            let bestMatch = null;
            let highestSimilarity = -1;

            // Comparar con cada modelo y sus sinónimos
            modelos.forEach(model => {
                // Crear array con modelo y sinónimos
                const modelTexts = [model.modelo, ...model.sinonimos].filter(text => text && text !== "");
                
                // Calcular similitud con cada texto del modelo
                modelTexts.forEach(modelText => {
                    const modelVector = textToVector(modelText);
                    const similarity = calculateSimilarity(productVector, modelVector);
                    
                    if (similarity > highestSimilarity) {
                        highestSimilarity = similarity;
                        bestMatch = model;
                    }
                });
            });

            // Crear respuesta con el mejor match encontrado
            const { titulo, precio, ...restProduct } = product;
            const response = {
                titulo,
                modelo: bestMatch ? bestMatch.modelo : "No se encontró coincidencia",
                precio,
                similitud: highestSimilarity,
                ...restProduct
            };

            console.log(
                `Coincidencia para "${titulo}": ${response.modelo} (similitud: ${highestSimilarity.toFixed(3)})`
            );

            results.push(response);

        } catch (error) {
            console.error(`Error procesando producto "${product.titulo}":`, error);
            results.push({
                ...product,
                modelo: "Error en el procesamiento",
                similitud: 0
            });
        }
    });

    return results;
};