import { Request, Response } from 'express';
import { Invoice, License } from '../models';
import { generateLicenseNo } from '../utils/ids';

/**
 * REVMIS Payment Webhook
 * Called by REVMIS when payment is received
 * Automatically issues license upon payment confirmation
 */
export async function revmisPaymentWebhook(req: Request, res: Response) {
  try {
    const { invoice_no, payment_reference, amount_paid, payment_date, status } = req.body;

    // Validate required fields
    if (!invoice_no || !payment_reference || !amount_paid) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: invoice_no, payment_reference, amount_paid' 
      });
    }

    // Find the invoice by invoice number
    const invoice = await Invoice.findOne({ where: { invoice_no } });
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        message: `Invoice ${invoice_no} not found` 
      });
    }

    // Verify payment amount matches invoice total
    if (parseFloat(amount_paid) !== invoice.total) {
      return res.status(400).json({ 
        success: false,
        message: `Payment amount mismatch. Expected: ${invoice.total}, Received: ${amount_paid}` 
      });
    }

    // Check if license already exists for this invoice
    const existingLicense = await License.findOne({ where: { invoice_id: invoice.id } });
    
    if (existingLicense) {
      return res.status(200).json({ 
        success: true,
        message: 'License already issued for this invoice',
        license_no: existingLicense.license_no,
        invoice_no: invoice.invoice_no
      });
    }

    // Update invoice payment status
    await invoice.update({
      payment_status: 'PAID',
      payment_reference,
      payment_date: payment_date || new Date()
    });

    // Automatically issue the license
    const license = await License.create({
      invoice_id: invoice.id,
      license_no: generateLicenseNo(),
      pdf_url: null,
      qr_code_url: null,
    });

    // Send success response back to REVMIS
    return res.status(200).json({ 
      success: true,
      message: 'Payment confirmed and license issued successfully',
      license_no: license.license_no,
      invoice_no: invoice.invoice_no,
      payment_reference
    });

  } catch (error) {
    console.error('REVMIS webhook error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error processing payment webhook' 
    });
  }
}
