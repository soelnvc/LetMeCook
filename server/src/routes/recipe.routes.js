const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All recipe actions require authentication
router.use(authMiddleware);

router.get('/', recipeController.getRecipes);
router.post('/', recipeController.createRecipe);
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;
