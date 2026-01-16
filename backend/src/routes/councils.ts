import { Router } from 'express';
import { Council } from '../models/council';

const router = Router();

// Get all councils
router.get('/', async (req, res) => {
  try {
    const councils = await Council.findAll({
      order: [['id', 'ASC']]
    });
    res.json(councils);
  } catch (err: any) {
    console.error('Failed to fetch councils:', err.message);
    res.status(500).json({ message: 'Failed to fetch councils' });
  }
});

// Create a council (admin only)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Council name is required' });
    }
    
    const council = await Council.create({ name });
    res.json(council);
  } catch (err: any) {
    console.error('Failed to create council:', err.message);
    res.status(500).json({ message: 'Failed to create council' });
  }
});

export default router;
