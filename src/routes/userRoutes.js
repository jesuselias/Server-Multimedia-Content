const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const loginController = require('../controllers/loginController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
// const multer = require('multer')

// const upload = multer({dest: 'uploads/'})


router.get('/img-content/:id', userController.getImgById);

router.get('/download-content/:id', userController.downloadContent);

router.post('/register', userController.registerUser);

router.post('/login', loginController.loginUser);

router.get('/profile', authenticateToken, authorize(['Admin', 'Creador']), userController.getUserProfile);

router.post('/contents', authenticateToken, authorize(['Admin','Creador']), upload.single('file'), userController.createUserContent);

router.get('/contentsTotal', authenticateToken, userController.getAllContents);

router.get('/contents', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.getUserContents);

router.get('/search-contents', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.searchContents);

router.get('/search-themes', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.searchThemes);

router.get('/list-themes', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.listThemes);

router.get('/content/:themeId', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), userController.getContentsThemeId);

router.get('/content-totals', userController.getContentTotals);



module.exports = router;
