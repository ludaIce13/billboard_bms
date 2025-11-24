import { Router } from 'express';
import auth from './auth';
import operators from './operators';
import licenseRequests from './licenseRequests';
import tariffs from './tariffs';
import invoices from './invoices';
import licenses from './licenses';
import users from './users';
import councils from './councils';

const router = Router();
router.use('/auth', auth);
router.use('/users', users);
router.use('/operators', operators);
router.use('/license-requests', licenseRequests);
router.use('/tariffs', tariffs);
router.use('/invoices', invoices);
router.use('/licenses', licenses);
router.use('/councils', councils);

export default router;
