import express from 'express';
import { createUser } from '../controllers/user.controller.js';
import { validateCreateUser } from '../middlewares/validator.middleware.js'

const router = express.Router();

router.post('/register', validateCreateUser, createUser);

export default router;