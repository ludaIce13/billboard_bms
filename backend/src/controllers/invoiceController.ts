import { Request, Response } from 'express';
import { Invoice, LicenseRequest, LicenseRequestItem, Operator, Tariff } from '../models';
import { generateInvoiceNo } from '../utils/ids';
import { postInvoiceToRevmis, buildRevmisInvoicePayload } from '../services/revmisService';

export async function generateInvoice(req: Request, res: Response) {
  try {
    const { operator_id, item_ids, request_id } = req.body;
    const GST_PERCENTAGE = 15;

    let resolvedOperatorId = operator_id as number | undefined;
    let resolvedItemIds = Array.isArray(item_ids) ? item_ids as number[] : undefined;

    // If only request_id is provided, resolve operator and APPROVED items from that request
    let councilId: number | undefined;
    if (request_id && (!resolvedOperatorId || !resolvedItemIds || resolvedItemIds.length === 0)) {
      const request = await LicenseRequest.findByPk(request_id);
      if (!request) {
        return res.status(404).json({ message: 'License request not found for invoice generation' });
      }

      resolvedOperatorId = request.operator_id;
      councilId = request.council_id;

      const requestItems = await LicenseRequestItem.findAll({ where: { request_id } });
      const approvedFromRequest = requestItems.filter(i => i.status === 'APPROVED');
      if (approvedFromRequest.length === 0) {
        return res.status(400).json({ message: 'No APPROVED items found for this license request' });
      }
      resolvedItemIds = approvedFromRequest.map(i => i.id);
    }

    if (!resolvedOperatorId || !resolvedItemIds || resolvedItemIds.length === 0) {
      return res.status(400).json({ message: 'operator_id and item_ids required, or provide a valid request_id with approved items' });
    }

    // If council_id not set from request, use env default
    if (!councilId) {
      councilId = Number(process.env.REVMIS_COUNCIL_ID || 1);
    }

    const items = await LicenseRequestItem.findAll({ where: { id: resolvedItemIds } });
    const approvedItems = items.filter(i => i.status === 'APPROVED');
    if (approvedItems.length === 0) return res.status(400).json({ message: 'No APPROVED items to invoice' });

    let subtotal = 0;
    const lineDetails: Array<{ item_id: number; tariff_amount: number }> = [];
    for (const it of approvedItems) {
      const tariff = await Tariff.findOne({
        where: {
          council_id: councilId,
          location_type: it.location_type,
          surface_area_bucket: it.surface_area_bucket,
        },
      });
      const amount = tariff ? Number(tariff.tariff_amount) : 0;
      if (!tariff) {
        console.warn('No matching tariff found for item', {
          item_id: it.id,
          council_id: councilId,
          location_type: it.location_type,
          surface_area_bucket: it.surface_area_bucket,
        });
      } else {
        console.log('Matched tariff for item', {
          item_id: it.id,
          council_id: councilId,
          location_type: it.location_type,
          surface_area_bucket: it.surface_area_bucket,
          tariff_amount: tariff.tariff_amount,
        });
      }
      subtotal += amount;
      lineDetails.push({ item_id: it.id, tariff_amount: amount });
    }
    const gst = (subtotal * GST_PERCENTAGE) / 100;
    const total = subtotal + gst;

    const invoice = await Invoice.create({
      invoice_no: generateInvoiceNo(),
      operator_id: resolvedOperatorId,
      request_id: request_id || null,
      subtotal,
      gst,
      total,
      revmis_status: 'PENDING',
    });
    res.json({ invoice, lineDetails, financials: { subtotal, gst_percentage: GST_PERCENTAGE, gst, total } });
  } catch (e) {
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
}

export async function previewRevmisInvoice(req: Request, res: Response) {
  try {
    // Accept minimal placeholder inputs and return a formatted payload
    const payload = buildRevmisInvoicePayload(req.body || {});
    res.json({ status: 'OK', payload });
  } catch (e) {
    res.status(500).json({ message: 'Failed to build REVMIS invoice payload' });
  }
}

export async function listInvoices(req: Request, res: Response) {
  try {
    const list = await Invoice.findAll({
      include: [
        Operator,
        {
          model: LicenseRequest,
          include: [LicenseRequestItem],
        },
      ],
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list invoices' });
  }
}

export async function sendInvoiceToRevmis(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const invoice = await Invoice.findByPk(id, {
      include: [
        Operator,
        {
          model: LicenseRequest,
          include: [LicenseRequestItem],
        },
      ],
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const anyInvoice: any = invoice as any;
    const operator: any = (invoice as any).operator;
    const licenseRequest: any = (invoice as any).license_request;
    const items: any[] = licenseRequest?.license_request_items || licenseRequest?.licenseRequestItems || [];

    const locationTypes = items.map(i => i.location_type as string);
    const plusCodes = items.map(i => i.plus_code as string);
    const surfaceAreas = items.map(i => i.surface_area_bucket as string);

    const invoiceDate = anyInvoice.createdAt
      ? new Date(anyInvoice.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    // Use the council_id from the license request, fallback to env if not set
    const councilId = licenseRequest?.council_id 
      ? Number(licenseRequest.council_id) 
      : Number(process.env.REVMIS_COUNCIL_ID || 0);

    const payload = {
      councilId,
      operatorId: `OP-${operator?.id ?? invoice.operator_id}`,
      operatorName: operator?.business_name || '',
      operatorAddress: operator?.address || '',
      operatorPhone: operator?.phone || '',
      operatorEmail: operator?.email || '',
      invoiceDate,
      licenseNo: invoice.invoice_no,
      locationTypes,
      plusCodes,
      surfaceAreas,
      amount: invoice.total,
    };

    console.log('[REVMIS] Prepared invoice payload', payload);

    const result = await postInvoiceToRevmis(payload);

    // If the REV-MIS call succeeded, mark this invoice as sent locally
    try {
      invoice.revmis_status = 'sent' as any;
      await invoice.save();
    } catch (err) {
      // Log but do not fail the REV-MIS response to the client
      console.error('Failed to update invoice revmis_status after sending to REVMIS:', err);
    }

    res.json(result);
  } catch (e) {
    console.error('Failed to send invoice to REVMIS:', e);
    res.status(500).json({ message: 'Failed to send invoice to REVMIS' });
  }
}

export async function deleteInvoice(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.destroy();
    return res.json({ message: 'Invoice deleted successfully' });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to delete invoice' });
  }
}
