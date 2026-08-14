import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import config from './config/env.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { sendSuccess } from './utils/response.js';
import { getRedisStatus } from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

app.use(
  '/api/v1',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

app.get('/api/v1/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  sendSuccess(res, 200, 'API is healthy', {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: dbStates[mongoose.connection.readyState] || 'unknown',
    cache: getRedisStatus(),
  });
});

app.get('/', (req, res) => {
  sendSuccess(res, 200, 'Social Media Platform API');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/reactions', reactionRoutes);
app.use('/api/v1/polls', pollRoutes);
app.use('/api/v1/stories', storyRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;