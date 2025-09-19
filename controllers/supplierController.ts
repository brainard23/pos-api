import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Supplier from '../models/Supplier';

/**
 * Get all suppliers
 * @param req Request object
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getSuppliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single supplier by ID
 * @param req Request object containing supplier ID
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new supplier
 * @param req Request object containing supplier data
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, phone, address } = req.body;

    // Check if supplier with email already exists
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      res.status(400).json({ message: 'Supplier with this email already exists' });
      return;
    }

    const supplier = new Supplier({
      name,
      email,
      phone,
      address
    });

    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a supplier
 * @param req Request object containing supplier ID and update data
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const updateSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }

    // Check for email uniqueness if email is being updated
    if (req.body.email && req.body.email !== supplier.email) {
      const existingSupplier = await Supplier.findOne({ email: req.body.email });
      if (existingSupplier) {
        res.status(400).json({ message: 'Supplier with this email already exists' });
        return;
      }
    }

    Object.assign(supplier, req.body);
    await supplier.save();
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a supplier
 * @param req Request object containing supplier ID
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const deleteSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }

    await supplier.deleteOne();
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 