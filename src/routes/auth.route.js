import express from 'express';
import { createUser, loginUser, logoutUser } from '../controllers/user.controller.js';
import { validateCreateUser, validateLoginUser } from '../middlewares/validator.middleware.js'

const router = express.Router();

router.post('/register', validateCreateUser, createUser);

router.post('/login', validateLoginUser, loginUser);

router.post('/logout', logoutUser);

export default router;