import express from 'express';
import { verifyUser } from '../middlewares/auth.middleware.js';
import { getAnalysis } from '../controllers/analysis.controller.js';

const router = express.Router();

router.post('/get-analysis', verifyUser, getAnalysis);

export default router;