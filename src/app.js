import express from 'express';
import authRouter from './routes/auth.route.js';
import resumeRouter from './routes/resume.route.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/resume',resumeRouter);

app.get("/", (req, res) => {
    res.status(201).json({ status: 200, message: "Server is healthy" });
});

export default app;