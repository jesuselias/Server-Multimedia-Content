const User = require('../models/User');
const Content = require('../models/Content');
const Theme = require('../models/Theme');
const bcrypt = require('bcryptjs');
//const fs = require('fs').promises;
// const path = require('path');
// const { promises: fs } = require('fs');

const fs = require('fs').promises;
const path = require('path');


const jwt = require('jsonwebtoken'); // Asegúrate de importarlo al inicio de tu archivo


exports.getImgById = async (req, res) => {
  try {
    const contentId = req.params.id;
    const content = await Content.findById(contentId);

    if (!content || !content.file) {
      return res.status(404).json({ message: 'Contenido o archivo no encontrado' });
    }

   

    res.json({ image: content.file });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Error al obtener el contenido' });
  }
};


exports.registerUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // Valida que el role sea "Lector" o "Creador"
    // if (req.body.role !== "Lector" && req.body.role !== "Creador") {
    //   return res.status(400).json({ message: 'El rol debe ser "Lector" o "Creador"' });
    // }

    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role
    });
    
    // Genera un token JWT válido durante un mes
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token: token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Busca el usuario en la base de datos
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Nombre de usuario o contraseña incorrectos' });
    }

    // Compara contraseñas
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Nombre de usuario o contraseña incorrectos' });
    }

    // Genera un token JWT válido durante un mes
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Inició sesión con éxito',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Buscar todos los creadores
    const creators = await User.find({ role: 'Creador' }).select('_id username email role');

    let contents = [];

    // Para cada creador, buscar sus contenidos
    for (let creator of creators) {
      const creatorContents = await Content.find({ creator: creator._id });
      contents.push(...creatorContents.map(content => ({
        ...content.toObject(),
        creator: creator.username
      })));
    }

    res.json({
      creators: creators,
      contents: contents
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

exports.listThemes = async (req, res) => {
  try {
    const themes = await Theme.find().select('_id name description');
    res.json(themes);
  } catch (error) {
    console.error('Error listing themes:', error);
    res.status(500).json({ message: 'Error fetching themes' });
  }
};



exports.createUserContent = async (req, res) => {
  try {
    const { title, type, themeId, credits, file, videoUrl } = req.body;


    if (!type || !['texto', 'imagen', 'video'].includes(type)) {
      throw new Error(`Tipo de contenido inválido: ${type}`);
    }

    let newContent;
    let filePath = '';
    let textContent = '';

    if (type === 'texto') {
      // Manejo del texto
      if (!title) {
        throw new Error('No se proporcionó un título para el texto');
      }
      
      textContent = title; // Asumimos que el título es el contenido del texto
      
      newContent = new Content({
        title,
        type,
        imageTextUrl: '',
        videoUrl: '',
        themeId,
        creatorId: req.user.userId,
        credits,
        content: textContent,
        createdAt: new Date() // Usamos la fecha actual al crear el contenido
      });
    } else if (type === 'imagen') {

      console.log("file",file)

      console.log("req.file",req.file)
      // Manejo de archivos de imagen
      if (!file) {
        throw new Error('No se encontró un archivo para la imagen');
      }
      
     // const filePath = req.file ? req.file.path : null;

     console.log('req.file:', req.file);
//console.log('req.file.buffer:', req.file.buffer);

//const filePath = req.file.path;
//const fileData = await fs.readFile(filePath);

// Convertir el archivo completo a base64
//const base64Image = `data:image/png;base64,${fileData.toString('base64')}`;
      
      newContent = new Content({
        title,
        type,
        imageTextUrl: null,
        videoUrl: '',
        themeId,
        creatorId: req.user.userId,
        credits,
        file,
        createdAt: new Date() // Usamos la fecha actual al crear el contenido
      });
    } else if (type === 'video') {
      // Manejo de videos YouTube
      if (!videoUrl) {
        throw new Error('No se proporcionó una URL de video');
      }
      
      newContent = new Content({
        title,
        type,
        imageTextUrl: '',
        videoUrl: videoUrl,
        themeId,
        creatorId: req.user.userId,
        credits,
        createdAt: new Date() // Usamos la fecha actual al crear el contenido
      });
    }

    if (!newContent) {
      throw new Error('Tipo de contenido no válido');
    }

    await newContent.save();

    // Aseguramos que siempre tenemos una fecha válida
    const createdAt = newContent.createdAt ? newContent.createdAt.toISOString() : null;

    res.status(201).json({
      message: 'Contenido creado con éxito',
      content: {
        _id: newContent._id,
        title: newContent.title,
        type: newContent.type,
        themeId: newContent.themeId,
        creatorId: newContent.creatorId,
        credits: newContent.credits,
        ...(newContent.videoUrl ? { videoUrl: newContent.videoUrl } : {}),
        ...(newContent.file ? { file: newContent.file } : {}),
        ...(newContent.content ? { content: newContent.content } : {})
      },
      createdAt: createdAt
    });
  } catch (error) {
    console.error('Error creating user content:', error.message);
    res.status(400).json({ 
      message: 'Error al crear contenido',
      details: error.message
    });
  }
};

// exports.createUserContent = async (req, res) => {
//   try {
//     const { title, type, themeId, credits } = req.body;

//     // Obtenemos la ruta del archivo subido
//     const filePath = req.file ? req.file.path : null;

//     const newContent = new Content({
//       title,
//       type,
//       imageTextUrl: filePath ? null : '',
//       videoUrl: filePath ? '' : null,
//       themeId,
//       creatorId: req.user.userId,
//       credits,
//       file: filePath // Almacenamos la ruta del archivo en la propiedad 'file'
//     });

//     const savedContent = await newContent.save();

//     res.status(201).json({
//       message: 'Contenido creado con éxito',
//       content: {
//         _id: savedContent._id,
//         title: savedContent.title,
//         type: savedContent.type,
//         themeId: savedContent.themeId,
//         creatorId: savedContent.creatorId,
//         credits: savedContent.credits,
//         file: savedContent.file
//       }
//     });
//   } catch (error) {
//     console.error('Error creating user content:', error);
//     res.status(500).json({ message: 'Error al crear contenido' });
//   }
// };

exports.searchContents = async (req, res) => {
  const searchTerm = req.query.term.toLowerCase();

  try {
    const contents = await Content.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { credits: { $regex: searchTerm, $options: 'i' } }
      ]
    }).select('title credits themeId');

    res.json(contents);
  } catch (error) {
    console.error('Error searching contents:', error);
    res.status(500).json({ message: 'Error al buscar contenidos' });
  }
};

exports.getContentsThemeId = async (req, res) => {
  const themeId = req.params.themeId;
  try {
    const contents = await Content.find({ themeId: themeId });
    res.json(contents);
  } catch (error) {
    console.error('Error fetching contents:', error);
    res.status(500).json({ message: 'Error al obtener contenidos' });
  }
};


exports.searchThemes = async (req, res) => {
  const searchTerm = req.query.term.toLowerCase();

  try {
    const themes = await Theme.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    }).select('name description');

    res.json(themes);
  } catch (error) {
    console.error('Error searching themes:', error);
    res.status(500).json({ message: 'Error al buscar temas' });
  }
};


exports.getContentTotals = async (req, res) => {
  try {
    const totalContents = await Content.countDocuments();
    const imagesCount = await Content.countDocuments({ type: 'imagen' });
    const videosCount = await Content.countDocuments({ type: 'video' });
    const textsCount = await Content.countDocuments({ type: 'texto' });

    res.json({
      total: totalContents,
      images: imagesCount,
      videos: videosCount,
      texts: textsCount
    });
  } catch (error) {
    console.error('Error en getContentTotals:', error);
    res.status(500).json({ message: 'Error al obtener totales de contenidos' });
  }
};


exports.getUserContents = async (req, res) => {
  try {
    const contents = await Content.find({ creator: req.userId }).populate('theme');
    res.json(contents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener contenidos del usuario' });
  }


};
