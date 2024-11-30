require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;

// const upload = multer({dest: '../uploads'})



//const upload = require('./middlewares/upload');

const path = require('path');

const app = express();

// app.post('/images/single', upload.single('imagenTest'), (req,res) => {
//   res.send('termina');
  
// });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../uploads')));

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, '../uploads/', filename));
});


// Assuming you're using Express.js
app.get('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  fs.readFile(`uploads/${filename}`, (err, data) => {
    if (err) {
      res.status(404).send('File not found');
    } else {
      res.contentType('image/jpeg'); // Set appropriate content type based on file extension
      res.send(data);
    }
  });
});


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