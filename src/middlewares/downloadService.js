const fs = require('fs').promises;
const path = require('path');

async function downloadFile(fileBuffer, fileName) {
  try {
    // Creamos un nombre único para el archivo temporal
    const tempFileName = `${fileName}.temp`;
    
    // Escribimos el buffer en un archivo temporal
    await fs.writeFile(tempFileName, fileBuffer);

    // Crea un enlace de descarga
    const filePath = path.join(__dirname, '..', 'downloads', fileName);
    await fs.rename(tempFileName, filePath);

    // Devuelve el nombre del archivo descargado
    return fileName;
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    throw new Error('Error al descargar el archivo');
  }
}

module.exports = { downloadFile };