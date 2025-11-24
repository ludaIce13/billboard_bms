import { Request, Response } from 'express';
import { Invoice, License, LicenseRequest, LicenseRequestItem, Operator } from '../models';
import { generateLicenseNo } from '../utils/ids';

export async function issueLicense(req: Request, res: Response) {
  try {
    const invoiceId = Number(req.params.invoiceId);
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const license = await License.create({
      invoice_id: invoice.id,
      license_no: generateLicenseNo(),
      pdf_url: null,
      qr_code_url: null,
    });

    res.json(license);
  } catch (e) {
    res.status(500).json({ message: 'Failed to issue license' });
  }
}

export async function listLicenses(req: Request, res: Response) {
  try {
    const list = await License.findAll({ 
      include: [{ 
        model: Invoice, 
        include: [
          Operator,
          {
            model: LicenseRequest,
            include: [LicenseRequestItem]
          }
        ] 
      }] 
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list licenses' });
  }
}
