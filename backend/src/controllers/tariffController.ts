import { Request, Response } from 'express';
import { Tariff } from '../models';
import { parse } from 'csv-parse/sync';
import { isValidLocationType, isValidSurfaceAreaBucket } from '../utils/enums';

type MulterFileWithBuffer = {
  buffer: Buffer;
};

export async function uploadTariffs(req: Request, res: Response) {
  try {
    const rows = req.body?.rows || [];
    if (!Array.isArray(rows)) return res.status(400).json({ message: 'rows array required' });
    const created: any[] = [];
    for (const r of rows) {
      const t = await Tariff.create(r);
      created.push(t);
    }
    res.json({ count: created.length });
  } catch (e) {
    res.status(500).json({ message: 'Failed to upload tariffs' });
  }
}

export async function listTariffs(req: Request, res: Response) {
  try {
    const list = await Tariff.findAll();
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list tariffs' });
  }
}

export async function uploadTariffsCsv(req: Request, res: Response) {
  try {
    const file = (req as any).file as MulterFileWithBuffer | undefined;
    if (!file || !file.buffer) return res.status(400).json({ message: 'CSV file required (field name: file)' });
    const text = file.buffer.toString('utf-8');
    const records = parse(text, { columns: true, skip_empty_lines: true });

    let created = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 because: +1 for 1-indexed, +1 for header row
      
      const council_id = Number(row.council_id || row.Council || row['Council ID']);
      const location_type = String(row.location_type || row.Location || '').trim();
      const surface_area_bucket = String(row.surface_area_bucket || row['Surface Area'] || '').trim();
      const tariff_amount = Number(row.tariff_amount || row['Tariff Amount']);

      // Detailed validation with error messages
      const rowErrors: string[] = [];
      
      if (!Number.isFinite(council_id) || council_id <= 0) {
        rowErrors.push(`Council ID must be a positive number (got: "${row.council_id || row.Council || row['Council ID']}")`);
      }
      
      if (!isValidLocationType(location_type)) {
        rowErrors.push(`Location must be one of: Peri-Urban Highways, Main Artery Road, Public Trunk Road, Community Access Road (got: "${location_type}")`);
      }
      
      if (!isValidSurfaceAreaBucket(surface_area_bucket)) {
        rowErrors.push(`Surface Area must be one of: <2m2, 2m2-5m2, 5m2-10m2, >10m2 (got: "${surface_area_bucket}")`);
      }
      
      if (!Number.isFinite(tariff_amount) || tariff_amount <= 0) {
        rowErrors.push(`Tariff Amount must be a positive number (got: "${row.tariff_amount || row['Tariff Amount']}")`);
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${rowNum}: ${rowErrors.join('; ')}`);
        continue;
      }
      
      await Tariff.create({ council_id, location_type, surface_area_bucket, tariff_amount });
      created++;
    }
    
    if (errors.length > 0 && created === 0) {
      // All rows failed
      return res.status(400).json({ 
        message: 'All rows failed validation', 
        count: 0,
        errors: errors.slice(0, 10), // Show first 10 errors
        totalErrors: errors.length
      });
    }
    
    res.json({ 
      count: created,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      totalErrors: errors.length
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed to upload CSV tariffs', error: e instanceof Error ? e.message : 'Unknown error' });
  }
}

export async function updateTariff(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const tariff = await Tariff.findByPk(id);
    if (!tariff) return res.status(404).json({ message: 'Tariff not found' });
    
    const { council_id, location_type, surface_area_bucket, tariff_amount } = req.body;
    if (council_id !== undefined) tariff.council_id = council_id;
    if (location_type !== undefined) tariff.location_type = location_type;
    if (surface_area_bucket !== undefined) tariff.surface_area_bucket = surface_area_bucket;
    if (tariff_amount !== undefined) tariff.tariff_amount = tariff_amount;
    
    await tariff.save();
    res.json(tariff);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update tariff' });
  }
}

export async function deleteTariff(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const tariff = await Tariff.findByPk(id);
    if (!tariff) return res.status(404).json({ message: 'Tariff not found' });
    
    await tariff.destroy();
    res.json({ message: 'Tariff deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete tariff' });
  }
}
