import { Router } from 'express';
import { fetchRevmisCouncils } from '../services/revmisService';

const router = Router();

// Get all councils from REV-MIS
router.get('/', async (req, res) => {
  try {
    const response = await fetchRevmisCouncils();
    res.json(response.data || []);
  } catch (err: any) {
    console.error('Failed to fetch councils from REV-MIS:', err.message);
    res.status(500).json({ message: 'Failed to fetch councils' });
  }
});

export default router;
