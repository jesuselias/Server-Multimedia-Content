const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

router.post('/categories', authenticateToken, authorize(['Admin','Creador']), adminController.createCategory);
router.post('/themes', authenticateToken, authorize(['Admin','Creador']), adminController.createTheme);
router.get('/contents', authenticateToken, authorize(['Admin', 'Creador', 'Lector']), adminController.getContentList);

router.get('/categories', authenticateToken, authorize(['Admin', 'Creador']), adminController.getCategories);

module.exports = router;
