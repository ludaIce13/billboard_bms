import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { validateBody } from '../middleware/validate';

const router = Router();
router.post('/register', validateBody([
  { name: 'name', required: true, type: 'string' },
  { name: 'email', required: true, type: 'email' },
  { name: 'password', required: true, type: 'string' },
  { name: 'role', required: true, type: 'string' },
]), register);
router.post('/login', validateBody([
  { name: 'email', required: true, type: 'email' },
  { name: 'password', required: true, type: 'string' },
]), login);
export default router;
