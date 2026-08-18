import express from 'express';
import multer from 'multer';
import { uploadResume } from '../controllers/resume.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post('/upload', verifyUser, upload.single('resume'), uploadResume);

export default router;