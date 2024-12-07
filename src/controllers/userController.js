const User = require('../models/User');
const Content = require('../models/Content');
const Theme = require('../models/Theme');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

//const fs = require('fs').promises;
// const path = require('path');
// const { promises: fs } = require('fs');




const jwt = require('jsonwebtoken'); // Asegúrate de importarlo al inicio de tu archivo


exports.getImgById = async (req, res) => {
  try {
    const contentId = req.params.id;
    const content = await Content.findById(contentId);

    console.log("content",content)

    if (!content || !content.image) {
      return res.status(404).json({ message: 'Contenido o archivo no encontrado' });
    }

   

    res.json({ image: content.image });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Error al obtener el contenido' });
  }
};

exports.downloadContent = async (req, res) => {
  try {
    const contentId = req.params.id;
    console.log('Attempting to download content with ID:', contentId);

    const content = await Content.findById(contentId);

    if (!content) {
      console.log('Content not found for ID:', contentId);
      return res.status(404).json({ message: 'Contenido no encontrado' });
    }

    if (!content.file) {
      console.log('No file associated with content ID:', contentId);
      return res.status(404).json({ message: 'Archivo no encontrado para este contenido' });
    }

    // Construct the file path correctly
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const filePath = path.join(uploadsDir, content.file);
    console.log('File path:', filePath);

    try {
      await fs.access(filePath);
    } catch (error) {
      console.log('File not found at path:', filePath);
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor', details: error.message });
    }

    const mimeType = mime.lookup(filePath);
    console.log('Mime type:', mimeType);

    if (!mimeType) {
      console.log('Unable to determine MIME type');
      return res.status(500).json({ message: 'No se pudo determinar el tipo MIME del archivo' });
    }

    console.log("mimeType",mimeType)

    if (mimeType.includes('video')) {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`); // Para videos se muestra en el navegador
    } else {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`); // Para otros tipos de archivos se descarga
    }

  

    // Use fs.createReadStream with promises
    const fileStream = await fs.readFile(filePath);
    
    // Pipe the stream to the response
    res.end(fileStream);
  } catch (error) {
    console.error('Error downloading content:', error);
    res.status(500).json({ message: 'Error al descargar el contenido', details: error.message });
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
    const { title, type, themeId, credits, image, file, videoUrl } = req.body;

    if (!type || !['archivo', 'imagen', 'video'].includes(type)) {
      throw new Error(`Tipo de contenido inválido: ${type}`);
    }

    let newContent;
    let filePath = '';
    let textContent = '';

    if (type === 'archivo') {
      if (!title) {
        throw new Error('No se proporcionó un título para el archivo');
      }
      
      if (req.file) {
        filePath = path.basename(req.file.path);
        console.log("filePath",filePath)
        const mimeType = req.file.mimetype;
        console.log("filePath",filePath)
        console.log("mimeType",mimeType)

       if (mimeType.startsWith('text/') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const fileBuffer = await fs.readFile(filePath);
          console.log("fileBuffer",fileBuffer)
          textContent = fileBuffer.toString();
        } else {
          textContent = null;
        }
      } else {
        textContent = title;
      }

     
      

      newContent = new Content({
        title,
        type,
        imageTextUrl: '',
        videoUrl: '',
        themeId,
        creatorId: req.user.userId,
        credits,
        content: textContent,
        file: filePath,
        createdAt: new Date()
      });
    } else if (type === 'imagen') {
      if (!image) {
        throw new Error('No se encontró un archivo para la imagen');
      }

      newContent = new Content({
        title,
        type,
        image,
        videoUrl: '',
        themeId,
        creatorId: req.user.userId,
        credits,
        file: req.file ? req.file.filename : null,
        createdAt: new Date()
      });
    } else if (type === 'video') {
      if (!videoUrl) {
        throw new Error('No se proporcionó una URL de video');
      }

      newContent = new Content({
        title,
        type,
        image: '',
        videoUrl: videoUrl,
        themeId,
        creatorId: req.user.userId,
        credits,
        createdAt: new Date()
      });
    }

    if (!newContent) {
      throw new Error('Tipo de contenido no válido');
    }

    await newContent.save();

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
        ...(newContent.image ? { image: newContent.image } : {}),
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
    const textsCount = await Content.countDocuments({ type: 'archivo' });

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
