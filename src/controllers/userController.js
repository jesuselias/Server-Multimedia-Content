const User = require('../models/User');
const Content = require('../models/Content');
const Theme = require('../models/Theme');
const bcrypt = require('bcryptjs');
const upload = require('../middlewares/upload');
const fs = require('fs').promises;

const jwt = require('jsonwebtoken'); // Asegúrate de importarlo al inicio de tu archivo


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
    console.log('Request received:', req.method, req.url);
    console.log("req", req.user.userId);
    const userId = req.user.userId;
    console.log("userId", userId);

    // Buscar todos los creadores
    const creators = await User.find({ role: 'Creador' }).select('_id username email role');

    console.log('Creators found:', creators);

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
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const { title, url, type, themeId, creatorId, credits, videoUrl } = req.body;
    console.log("creatorId",creatorId)

    let content;
    let imageUrl;

    if (type === 'image' || type === 'text') {
      if (!req.file) {
        return res.status(400).json({ message: 'Archivo requerido' });
      }

      imageUrl = `/uploads/${req.file.filename}`;

      content = await Content.create({
        title,
        type,
        url,
        themeId,
        creatorId: creatorId,
        credits,
        imageUrl,
        file: req.file.buffer // Guarda el buffer del archivo
      });

    } else if (type === 'video') {
      content = await Content.create({
        title,
        type,
        themeId,
        creatorId: creatorId,
        credits,
        videoUrl,
      });
    }

    res.status(201).json(content);
  } catch (error) {
    console.error('Error en createUserContent:', error);
    res.status(500).json({ message: 'Error al crear contenido' });
  }
};

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
    const imagesCount = await Content.countDocuments({ type: 'image' });
    const videosCount = await Content.countDocuments({ type: 'video' });
    const textsCount = await Content.countDocuments({ type: 'text' });

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
