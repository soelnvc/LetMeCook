const Recipe = require('../models/Recipe');

const escapeRegex = (string) => {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
};

const createRecipe = async (userId, recipeData) => {
  const {
    name,
    description,
    category,
    type = 'regular',
    joinMode = 'auto',
    capacity,
    location,
    eligibility
  } = recipeData;

  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    const error = new Error('Recipe name is required');
    error.statusCode = 400;
    throw error;
  }

  const trimmedDescription = (description || '').trim();
  if (!trimmedDescription) {
    const error = new Error('Recipe description is required');
    error.statusCode = 400;
    throw error;
  }

  if (!category) {
    const error = new Error('Recipe category is required');
    error.statusCode = 400;
    throw error;
  }

  // Case-insensitive check to guarantee strict unique recipe name per account
  const existing = await Recipe.findOne({
    user: userId,
    name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, 'i') }
  });

  if (existing) {
    const error = new Error('A recipe with this name already exists. Please choose a unique name.');
    error.statusCode = 409;
    throw error;
  }

  const recipe = await Recipe.create({
    user: userId,
    name: trimmedName,
    description: trimmedDescription,
    category,
    type,
    joinMode,
    capacity: capacity || { max: 4, unlimited: false },
    location: {
      areaName: location?.areaName?.trim() || 'Campus Court'
    },
    eligibility: eligibility || {
      gender: 'any',
      age: { min: null, max: null },
      instituteOnly: false,
      skillLevel: null
    }
  });

  return recipe;
};

const getRecipes = async (userId) => {
  const recipes = await Recipe.find({ user: userId }).sort({ createdAt: -1 });
  return recipes;
};

const deleteRecipe = async (userId, recipeId) => {
  const recipe = await Recipe.findOneAndDelete({ _id: recipeId, user: userId });
  if (!recipe) {
    const error = new Error('Recipe not found or you do not have permission to delete it');
    error.statusCode = 404;
    throw error;
  }
  return recipe;
};

module.exports = {
  createRecipe,
  getRecipes,
  deleteRecipe
};
