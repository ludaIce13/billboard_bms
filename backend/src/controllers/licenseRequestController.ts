import { Request, Response } from 'express';
import { LicenseRequest, LicenseRequestItem, Operator } from '../models';
import { generatePlusCode } from '../utils/plusCode';

export async function createLicenseRequest(req: Request, res: Response) {
  try {
    const { operator_id, council_id, items } = req.body; // items: array of request items
    
    // Validate that operator exists and is approved
    const operator = await Operator.findByPk(operator_id);
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found. Please register as an operator first.' });
    }
    
    if (operator.status !== 'APPROVED') {
      return res.status(403).json({ 
        message: `Cannot submit license request. Your operator application is currently ${operator.status}. Only APPROVED operators can submit license requests.` 
      });
    }
    
    const lr = await LicenseRequest.create({ operator_id, council_id });
    if (Array.isArray(items)) {
      for (const it of items) {
        // Auto-generate Plus Code from GPS coordinates
        const plusCode = generatePlusCode(it.gps_lat, it.gps_long);
        await LicenseRequestItem.create({ 
          ...it, 
          request_id: lr.id,
          plus_code: plusCode 
        });
      }
    }
    const full = await LicenseRequest.findByPk(lr.id, { include: [LicenseRequestItem, Operator] });
    res.json(full);
  } catch (e) {
    console.error('Error creating license request:', e);
    res.status(500).json({ message: 'Failed to create license request' });
  }
}

export async function listLicenseRequests(req: Request, res: Response) {
  try {
    const list = await LicenseRequest.findAll({ include: [LicenseRequestItem, Operator] });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list license requests' });
  }
}

export async function approveLicenseRequestItem(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body; // APPROVED or REJECTED
    const item = await LicenseRequestItem.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.status = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    await item.save();
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update item status' });
  }
}
