import { Router } from 'express';
import { approveOperator, createOperator, listOperators, rejectOperator } from '../controllers/operatorController';
import { requireRole, verifyToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.post('/', validateBody([
  { name: 'business_name', required: true, type: 'string' },
  { name: 'phone', required: true, type: 'string' },
  { name: 'email', required: true, type: 'email' },
  { name: 'address', required: true, type: 'string' },
]), createOperator);
router.get('/', verifyToken, requireRole(['SUPER_ADMIN', 'MANAGER']), listOperators);
router.post('/:id/approve', verifyToken, requireRole(['SUPER_ADMIN', 'MANAGER']), approveOperator);
router.post('/:id/reject', verifyToken, requireRole(['SUPER_ADMIN', 'MANAGER']), rejectOperator);
export default router;
