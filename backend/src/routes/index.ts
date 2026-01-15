import { Router } from 'express';
import auth from './auth';
import operators from './operators';
import licenseRequests from './licenseRequests';
import tariffs from './tariffs';
import invoices from './invoices';
import licenses from './licenses';
import users from './users';
import councils from './councils';
import webhook from './webhook';

const router = Router();
// Health endpoint for GET /api
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});
router.use('/auth', auth);
router.use('/users', users);
router.use('/operators', operators);
router.use('/license-requests', licenseRequests);
router.use('/tariffs', tariffs);
router.use('/invoices', invoices);
router.use('/licenses', licenses);
router.use('/councils', councils);
router.use('/webhook', webhook);

export default router;
