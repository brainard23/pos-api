import express from 'express';
import { protect as auth } from '../middleware/auth';
import { getDashboard } from '../controllers/dashboardController';

const router = express.Router();

// Routes
router.get('/', auth, getDashboard);


export default router; 