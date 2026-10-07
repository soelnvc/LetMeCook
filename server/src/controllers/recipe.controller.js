const recipeService = require('../services/recipe.service');

const createRecipe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const recipe = await recipeService.createRecipe(userId, req.body);
    res.status(201).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};

const getRecipes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const recipes = await recipeService.getRecipes(userId);
    res.status(200).json({
      success: true,
      data: recipes
    });
  } catch (error) {
    next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const recipe = await recipeService.deleteRecipe(userId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  deleteRecipe
};
