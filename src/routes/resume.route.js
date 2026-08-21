import express from 'express';
import multer from 'multer';
import { uploadResume, uploadJd, getAllResumes, getAllJds } from '../controllers/resume.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';
import { validateJdUpload } from '../middlewares/validator.middleware.js';

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post('/upload', verifyUser, upload.single('resume'), uploadResume);

router.get('/resumes', verifyUser, getAllResumes);

router.post('/jd-upload', verifyUser, validateJdUpload, uploadJd);

router.get('/jds',verifyUser,getAllJds);

export default router;