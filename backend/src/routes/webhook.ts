import { Router } from 'express';
import { revmisPaymentWebhook } from '../controllers/webhookController';
import { validateApiKey } from '../middleware/apiKeyAuth';

const router = Router();

// REVMIS payment webhook - protected with API key authentication
router.post('/revmis/payment', validateApiKey, revmisPaymentWebhook);

export default router;
