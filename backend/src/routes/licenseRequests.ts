import { Router } from 'express';
import { approveLicenseRequestItem, createLicenseRequest, listLicenseRequests } from '../controllers/licenseRequestController';
import { requireRole, verifyToken } from '../middleware/auth';

const router = Router();

// Allow operators to submit their own requests, and admins/managers to submit on behalf of operators
router.post('/', verifyToken, requireRole(['OPERATOR', 'SUPER_ADMIN', 'MANAGER']), createLicenseRequest);

router.get('/', verifyToken, requireRole(['SUPER_ADMIN', 'MANAGER', 'BILLING']), listLicenseRequests);
router.post('/:id/approve', verifyToken, requireRole(['SUPER_ADMIN', 'MANAGER', 'BILLING']), approveLicenseRequestItem);

export default router;
