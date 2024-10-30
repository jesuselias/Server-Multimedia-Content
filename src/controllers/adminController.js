const Category = require('../models/Category');
const Theme = require('../models/Theme');
const Content = require('../models/Content');

exports.createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const newCategory = await Category.create({ name, description});
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};


exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las categorías' });
  }
};

exports.createTheme = async (req, res) => {
  try {
    const { name, description, contentTypes, permissions } = req.body;

    // Valida que el nombre de la temática sea único
    const existingTheme = await Theme.findOne({ name });
    if (existingTheme) {
      return res.status(409).json({ message: 'La temática ya existe' });
    }

    // Valida los tipos de contenido
    const validContentTypes = ['images', 'videos', 'texts'];
    if (!contentTypes.every(type => validContentTypes.includes(type))) {
      return res.status(400).json({ message: 'Los tipos de contenido deben ser images, videos o texts' });
    }

    const newTheme = await Theme.create({
      name,
      description,
      contentTypes,
      permissions
    });

    res.status(201).json(newTheme);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la temática' });
  }
};


exports.getContentList = async (req, res) => {
  try {
    const contents = await Content.find().populate('theme creator');
    res.json(contents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los contenidos' });
  }
};
