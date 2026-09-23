import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profiles';
import skillRoutes from './routes/skills';
import searchRoutes from './routes/search';
import workRoutes from './routes/works';
import requestRoutes from './routes/requests';
import reviewRoutes from './routes/reviews';
import chatRoutes from './routes/chats';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/users', searchRoutes);
app.use('/api/works', workRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chats', chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
