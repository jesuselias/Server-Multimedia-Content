require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;



const path = require('path');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../uploads')));






app.use(express.static('uploads')); // Asegúrate de que 'uploads' sea la carpeta donde se guardan las imágenes

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