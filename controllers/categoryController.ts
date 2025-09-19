import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Category from '../models/Category';

/**
 * Get all categories
 * @param req Request object
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single category by ID
 * @param req Request object containing category ID
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category
 * @param req Request object containing category data
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, description, parent } = req.body;

    // Check if category with name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }

    // If parent category is provided, verify it exists
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        res.status(400).json({ message: 'Parent category not found' });
        return;
      }
    }

    const category = new Category({
      name,
      description,
      parent
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a category
 * @param req Request object containing category ID and update data
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check for name uniqueness if name is being updated
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({ name: req.body.name });
      if (existingCategory) {
        res.status(400).json({ message: 'Category with this name already exists' });
        return;
      }
    }

    // If parent category is being updated, verify it exists
    if (req.body.parent && req.body.parent !== category.parent) {
      const parentCategory = await Category.findById(req.body.parent);
      if (!parentCategory) {
        res.status(400).json({ message: 'Parent category not found' });
        return;
      }
    }

    Object.assign(category, req.body);
    await category.save();
    res.json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category
 * @param req Request object containing category ID
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check if category has any child categories
    const hasChildren = await Category.exists({ parent: category._id });
    if (hasChildren) {
      res.status(400).json({ message: 'Cannot delete category with child categories' });
      return;
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 