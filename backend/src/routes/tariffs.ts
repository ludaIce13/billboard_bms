import { Router } from 'express';
import { listTariffs, uploadTariffs, uploadTariffsCsv, updateTariff, deleteTariff } from '../controllers/tariffController';
import { requireRole, verifyToken } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post('/upload', verifyToken, requireRole(['SUPER_ADMIN', 'MANAGER', 'BILLING']), uploadTariffs);
router.post('/upload-csv', verifyToken, requireRole(['SUPER_ADMIN', 'MANAGER', 'BILLING']), upload.single('file'), uploadTariffsCsv);
router.get('/', listTariffs);
router.put('/:id', verifyToken, requireRole(['SUPER_ADMIN', 'MANAGER', 'BILLING']), updateTariff);
router.delete('/:id', verifyToken, requireRole(['SUPER_ADMIN', 'MANAGER', 'BILLING']), deleteTariff);
export default router;
