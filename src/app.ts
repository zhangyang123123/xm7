import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import apiRoutes from './routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'CMS REST API',
      version: '1.0.0',
      endpoints: {
        posts: '/api/posts',
        categories: '/api/categories',
        tags: '/api/tags',
      },
    },
  });
});

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
