require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const upload = require('./middlewares/upload');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar para servir archivos estáticos desde la raíz
const staticPath = path.join(__dirname,  '..', 'uploads');
app.use(express.static(staticPath));

// Servicio para servir archivos
app.get('/api/files/uploads/:filename', async (req, res) => {
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

    await fs.readFile(filePath, 'buffer');
    res.end();
  } catch (err) {
    console.error(`Error serving file ${filename}:`, err);
    res.status(err.code === 'ENOENT' ? 404 : 500).send(err.message);
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({ message: err.message });
});

// Importar y usar la función de conexión
const connectDB = require('./database/db');

connectDB().then(() => {
  console.log('Database connection successful');
}).catch((err) => {
  console.error('Error connecting to database:', err);
});

// Importar rutas
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const fileService = require('./routes/getFile');

// Usar las rutas
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/', fileService);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});