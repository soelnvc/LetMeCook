const dishService = require('../services/dish.service');

const createDish = async (req, res, next) => {
  try {
    const dish = await dishService.createDish(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      data: dish
    });
  } catch (error) {
    next(error);
  }
};

const getDishes = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.userId : null;
    const dishes = await dishService.getDishes(userId, req.query);
    res.status(200).json({
      success: true,
      data: dishes
    });
  } catch (error) {
    next(error);
  }
};

const getDishById = async (req, res, next) => {
  try {
    const dish = await dishService.getDishById(req.params.id);
    res.status(200).json({
      success: true,
      data: dish
    });
  } catch (error) {
    next(error);
  }
};

const joinDish = async (req, res, next) => {
  try {
    const result = await dishService.joinDish(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await dishService.transitionDishStatus(req.params.id, req.user.userId, status);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDish,
  getDishes,
  getDishById,
  joinDish,
  updateStatus
};
