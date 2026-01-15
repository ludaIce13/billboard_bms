import { Router } from 'express';
import { revmisPaymentWebhook } from '../controllers/webhookController';
import { validateApiKey } from '../middleware/apiKeyAuth';

const router = Router();

// REVMIS payment webhook - protected with API key authentication
router.post('/revmis/payment', validateApiKey, revmisPaymentWebhook);

// Helpful response for accidental GET requests in browser
router.get('/revmis/payment', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'Method Not Allowed. Use POST with Content-Type: application/json and X-API-Key header.'
  });
});

export default router;
