import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { seed } from './seed';

dotenv.config({ override: true });
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Billboard Management System API Running'));

import apiRoutes from './routes';
import { initDatabase } from '../config/database';
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
initDatabase().then(async () => {
  // Run seed to create default users
  await seed();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
