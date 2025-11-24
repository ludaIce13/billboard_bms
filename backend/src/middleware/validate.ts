import { Request, Response, NextFunction } from 'express';

export type FieldRule = {
  name: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'enum' | 'array';
  enumValues?: string[];
};

export function validateBody(rules: FieldRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body || {};
    for (const r of rules) {
      const v = body[r.name];
      if (r.required && (v === undefined || v === null || v === '')) {
        return res.status(400).json({ message: `${r.name} is required` });
      }
      if (v === undefined || v === null) continue;
      if (r.type === 'string' && typeof v !== 'string') return res.status(400).json({ message: `${r.name} must be string` });
      if (r.type === 'number' && typeof v !== 'number') return res.status(400).json({ message: `${r.name} must be number` });
      if (r.type === 'array' && !Array.isArray(v)) return res.status(400).json({ message: `${r.name} must be array` });
      if (r.type === 'email' && (typeof v !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))) return res.status(400).json({ message: `${r.name} must be valid email` });
      if (r.type === 'enum' && (!r.enumValues || !r.enumValues.includes(String(v)))) return res.status(400).json({ message: `${r.name} must be one of ${r.enumValues?.join(', ')}` });
    }
    next();
  };
}
