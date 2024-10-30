const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const loginController = require('../controllers/loginController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');


router.post('/register', userController.registerUser);

router.post('/login', loginController.loginUser);

router.get('/profile', authenticateToken, authorize(['Admin', 'Creador']), userController.getUserProfile);
router.post('/contents', authenticateToken, authorize(['Admin','Creador']), upload.single('file'), userController.createUserContent);

router.get('/contents', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.getUserContents);

router.get('/search-contents', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.searchContents);

router.get('/search-themes', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.searchThemes);

router.get('/list-themes', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.listThemes);

router.get('/content/:themeId', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.getContentsThemeId);

router.get('/content-totals', userController.getContentTotals);

router.get('/img-content/:id', async (req, res) => {
    try {
      const contentId = req.params.id;
      const content = await userController.getImgContentById(contentId);
      
      if (!content) {
        return res.status(404).json({ message: 'Contenido no encontrado' });
      }
  
      // Aquí puedes agregar más lógica si es necesario
  
      res.json(content);
    } catch (error) {
      console.error('Error en getImgContentById:', error);
      res.status(500).json({ message: 'Error al obtener el contenido' });
    }
  });

module.exports = router;
