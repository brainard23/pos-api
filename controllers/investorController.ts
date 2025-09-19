import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Investor from '../models/Investor';

export const listInvestors = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const investors = await Investor.find().sort({ createdAt: -1 });
    res.json(investors);
  } catch (err) {
    next(err);
  }
};

export const createInvestor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const investor = await Investor.create(req.body);
    res.status(201).json(investor);
  } catch (err) {
    next(err);
  }
};

export const getInvestorPerformance = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const investors = await Investor.find();
    // Basic performance calculation: monthlyPayment = (principal + principal*interest) / months
    const performance = investors.map(inv => {
      const monthlyPayment = (inv.principal + inv.principal * inv.interest) / inv.months;
      return {
        investorId: inv._id,
        name: inv.name,
        email: inv.email,
        principal: inv.principal,
        interest: inv.interest,
        months: inv.months,
        monthlyPayment,
        startDate: inv.startDate,
      };
    });
    res.json(performance);
  } catch (err) {
    next(err);
  }
};

export const updateInvestor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { id } = req.params;
    const updated = await Investor.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Investor not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteInvestor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await Investor.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: 'Investor not found' });
      return;
    }
    res.json({ message: 'Investor deleted' });
  } catch (err) {
    next(err);
  }
};


