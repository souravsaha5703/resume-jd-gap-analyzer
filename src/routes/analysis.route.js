import express from 'express';
import { verifyUser } from '../middlewares/auth.middleware.js';
import { getAnalysis, getAllAnalyses } from '../controllers/analysis.controller.js';

const router = express.Router();

router.post('/get-analysis', verifyUser, getAnalysis);

router.get('/analyses', verifyUser, getAllAnalyses);

export default router;