import { Router } from 'express';
import { issueLicense, listLicenses } from '../controllers/licenseController';
import { requireRole, verifyToken } from '../middleware/auth';

const router = Router();
router.post('/:invoiceId/issue', verifyToken, requireRole(['BILLING']), issueLicense);
router.get('/', verifyToken, listLicenses);
export default router;
