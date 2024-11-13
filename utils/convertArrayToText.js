import fs from 'fs';
//import { allProducts } from '../excel/array.js';

export const convertArrayToText = (array) => {
    //const filePath = 'products.txt'; // Ruta del archivo de salida
    /* const content = allProducts.map(product => {
        return `Título: ${product.titulo}. Precio: $ ${product.precio}. Ubicación: ${product.ubicacion}. Vendedor: ${product.vendedor}. Atributos: ${product.atributos}.`;
    }).join('\n'); */
    const content = array.map(product => {
        return `Título: ${product.titulo}. Precio: $ ${product.precio}. Ubicación: ${product.ubicacion}. Vendedor: ${product.vendedor}. Atributos: ${product.atributos}.`;
    }).join('\n');

    /* fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Archivo ${filePath} generado con éxito.`);
    const txtFile = filePath */
    return content
}

// Llama a la función para generar el archivo
//generateProductTxt();
// ... existing code ...