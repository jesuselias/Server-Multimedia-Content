const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const mime = require('mime-types');

const app = express();

// Configurar para servir archivos estáticos desde la raíz
const staticPath = path.join(__dirname, '..', '..', 'uploads');
app.use(express.static(staticPath));

// Servicio para servir archivos
app.get('/api/files/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(staticPath, filename);

  console.log(`Intentando acceder a archivo: ${filePath}`);

  try {
    // Verificar si el archivo existe
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      throw new Error('Archivo no encontrado');
    }

    // Determinar el tipo MIME del archivo
    const mimeType = mime.lookup(filename) || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await fs.readFile(filePath, 'utf8');
    res.end();
  } catch (err) {
    console.error(`Error serving file ${filename}:`, err);
    res.status(err.code === 'ENOENT' ? 404 : 500).send(err.message);
  }
});

module.exports = app;