import Prices from '../../models/prices.js';
import { precios } from '../../excel/listaPreciosFlow1.js';

// Función para crear la base de datos - se usa una sola vez!!!!!
export const pricesModelCreation = async (req, res) => {
  try {
    // Elimina todos los documentos existentes en la colección Prices
    await Prices.deleteMany({});

    // Itera sobre cada precio y crea un nuevo documento de Prices
    for (const precio of precios) {
      await Prices.create(precio);
    }
    console.log('Modelo Prices creado en MongoDB.');
    res.status(200).send("Modelo Prices creado en MongoDB")
  } catch (error) {
    console.error('Error al crear el modelo Prices:', error);
    res.status(500).send({error: error.message})
  }
};


