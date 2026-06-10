import dotenv from 'dotenv';
import app from './app';
import { pool } from './db';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully');
  } catch (err) {
    console.error('✗ Failed to connect to database:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✓ Server is running on http://localhost:${PORT}`);
  });
}

bootstrap();
