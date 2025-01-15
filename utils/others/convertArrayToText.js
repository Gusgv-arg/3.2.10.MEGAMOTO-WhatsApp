import fs from "fs";

export const convertArrayToText = (array) => {
	const content = array
		.map((product) => {
			return `Título: ${product.titulo}. Precio: $ ${product.precio}. Ubicación: ${product.ubicacion}. Vendedor: ${product.vendedor}. Atributos: ${product.atributos}.`;
		})
		.join("\n");

    // Limpiar caracteres "*", "|" y "-"
	const cleanedContent = content.replace(/[\*]/g, ''); // Asegúrate de que la expresión regular esté bien formada
    
	return cleanedContent;
};
