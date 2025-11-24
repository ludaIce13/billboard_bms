import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models';

// Super Admin creates users (Manager/Billing/Operator if needed)
export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: 'name, email, password, phone, role required' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone, role });
    return res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to create user' });
  }
}

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'phone', 'role'] });
    return res.json(users);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to list users' });
  }
}

// Super Admin can update basic user info (name, phone, role). Email/password changes can be handled separately if needed.
export async function updateUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, role } = req.body;

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;

    await user.save();

    return res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to update user' });
  }
}

// Super Admin can delete users (except optionally self in UI logic)
export async function deleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to delete user' });
  }
}
