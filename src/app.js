import express from 'express';
import authRouter from './routes/auth.route.js';
import resumeRouter from './routes/resume.route.js';
import analysisRouter from './routes/analysis.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://localhost:5173'],
    exposedHeaders: ['X-Data-Version'],
    credentials: true
}));
app.use('/api/auth', authRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/analysis', analysisRouter);

app.get("/", (req, res) => {
    res.status(201).json({ status: 200, message: "Server is healthy" });
});

export default app;