import { Router } from 'express';
import { generateInvoice, listInvoices, sendInvoiceToRevmis, previewRevmisInvoice, deleteInvoice } from '../controllers/invoiceController';
import { verifyToken, requireRole } from '../middleware/auth';
import { postInvoiceToRevmis } from '../services/revmisService';

const router = Router();
// Only BILLING users can generate or delete invoices
router.post('/', verifyToken, requireRole(['BILLING']), generateInvoice);
router.delete('/:id', verifyToken, requireRole(['BILLING']), deleteInvoice);

// All authenticated roles may list invoices and send them to REVMIS
router.get('/', verifyToken, listInvoices);
router.post('/:id/revmis', verifyToken, sendInvoiceToRevmis);
// public placeholder tester
router.post('/revmis', async (req, res) => {
  const result = await postInvoiceToRevmis(req.body);
  res.json(result);
});
// public preview of REVMIS payload (no outbound call)
router.post('/preview-revmis', previewRevmisInvoice);
export default router;
