import { Router } from 'express';
import { createUser, listUsers, updateUser, deleteUser } from '../controllers/userController';
import { requireRole, verifyToken } from '../middleware/auth';

const router = Router();

// Super Admin only
router.post('/', verifyToken, requireRole(['SUPER_ADMIN']), createUser);
router.get('/', verifyToken, requireRole(['SUPER_ADMIN']), listUsers);
router.put('/:id', verifyToken, requireRole(['SUPER_ADMIN']), updateUser);
router.delete('/:id', verifyToken, requireRole(['SUPER_ADMIN']), deleteUser);

export default router;
