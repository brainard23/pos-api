import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Product from '../models/Product';

/**
 * Get all products with pagination and search
 * @param req Request object containing query parameters for pagination and search
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 0; 
    const search = req.query.search as string || '';

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await Product.countDocuments(query);

    const productsQuery = Product.find(query).sort({ name: 1 }).skip((page - 1) * limit);

    if (limit > 0) {
    productsQuery.limit(limit);
    }
    const products = await productsQuery;

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product
 * @param req Request object containing product data
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      name,
      description,
      sku,
      barcode,
      category,
      price,
      cost,
      stock,
      minStock,
      supplier,
      unit,
    } = req.body;

    // Check if product with SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      res.status(400).json({ message: 'Product with this SKU already exists' });
      return;
    }

    // Check if product with barcode already exists (if provided)
    if (barcode) {
      const existingBarcode = await Product.findOne({ barcode });
      if (existingBarcode) {
        res.status(400).json({ message: 'Product with this barcode already exists' });
        return;
      }
    }

    const product = new Product({
      name,
      description,
      sku,
      barcode,
      category,
      price,
      cost,
      stock,
      minStock,
      supplier,
      unit,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by ID
 * @param req Request object containing product ID
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product
 * @param req Request object containing product ID and update data
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check for SKU uniqueness if SKU is being updated
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku });
      if (existingProduct) {
        res.status(400).json({ message: 'Product with this SKU already exists' });
        return;
      }
    }

    // Check for barcode uniqueness if barcode is being updated
    if (req.body.barcode && req.body.barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({ barcode: req.body.barcode });
      if (existingBarcode) {
        res.status(400).json({ message: 'Product with this barcode already exists' });
        return;
      }
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product
 * @param req Request object containing product ID
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 