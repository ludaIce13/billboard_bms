import { Request, Response } from 'express';
import { Operator } from '../models';
import { sendEmail } from '../services/emailService';

export async function createOperator(req: Request, res: Response) {
  try {
    const { business_name, phone, email, address, category, business_license_status } = req.body;
    if (!business_name || !phone || !email || !address || !category || !business_license_status) {
      return res.status(400).json({ message: 'business_name, phone, email, address, category, business_license_status are required' });
    }

    const allowedCategory = ['NEW', 'EXISTING'];
    const allowedStatus = ['PAID', 'PENDING'];

    if (!allowedCategory.includes(category)) {
      return res.status(400).json({ message: 'Invalid category. Use NEW or EXISTING' });
    }

    if (!allowedStatus.includes(business_license_status)) {
      return res.status(400).json({ message: 'Invalid business_license_status. Use PAID or PENDING' });
    }

    // Prevent duplicate operators by email
    const existing = await Operator.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'An operator with this email already exists' });
    }

    const op = await Operator.create({ business_name, phone, email, address, category, business_license_status });
    // Best-effort confirmation email
    try {
      await sendEmail(
        email,
        'Billboard Operator Application Received',
        `<p>Dear ${business_name},</p>
         <p>Your operator application has been received and is currently under review.</p>
         <p>We will notify you once it has been approved or rejected.</p>
         <p>Thank you.</p>`
      );
    } catch (err) {
      console.error('Failed to send operator submission email:', err);
    }

    return res.json(op);
  } catch (e: any) {
    console.error('Failed to create operator:', e);
    return res.status(500).json({ message: 'Failed to create operator' });
  }
}

export async function listOperators(req: Request, res: Response) {
  try {
    const ops = await Operator.findAll();
    res.json(ops);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list operators' });
  }
}

export async function getOperator(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const op = await Operator.findByPk(id);
    if (!op) {
      return res.status(404).json({ message: 'Operator not found' });
    }
    res.json(op);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get operator' });
  }
}

export async function getOperatorByPhone(req: Request, res: Response) {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    const op = await Operator.findOne({ where: { phone: phone as string } });
    if (!op) {
      return res.status(404).json({ message: 'Operator not found with this phone number' });
    }
    // Return only necessary fields for security
    res.json({
      id: op.id,
      business_name: op.business_name,
      phone: op.phone,
      status: op.status
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed to lookup operator' });
  }
}

export async function approveOperator(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const op = await Operator.findByPk(id);
    if (!op) return res.status(404).json({ message: 'Operator not found' });
    op.status = 'APPROVED';
    await op.save();
    // Best-effort approval email
    try {
      await sendEmail(
        op.email,
        'Billboard Operator Application Approved',
        `<p>Dear ${op.business_name},</p>
         <p>Your operator application has been <strong>approved</strong>!</p>
         <p>You can now proceed to submit billboard license requests.</p>
         <p><strong>Submit a New License Request:</strong><br/>
         <a href="http://localhost:5173/operator-request" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Click Here to Submit License Request</a></p>
         <p>Or copy this link: <a href="http://localhost:5173/operator-request">http://localhost:5173/operator-request</a></p>
         <p>Thank you.</p>`
      );
    } catch (err) {
      console.error('Failed to send operator approval email:', err);
    }

    res.json(op);
  } catch (e) {
    res.status(500).json({ message: 'Failed to approve operator' });
  }
}

export async function rejectOperator(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const op = await Operator.findByPk(id);
    if (!op) return res.status(404).json({ message: 'Operator not found' });
    op.status = 'REJECTED';
    await op.save();
    // Best-effort rejection email
    try {
      await sendEmail(
        op.email,
        'Billboard Operator Application Rejected',
        `<p>Dear ${op.business_name},</p>
         <p>Your operator application has been <strong>rejected</strong>.</p>
         <p>If you believe this is an error or need more information, please contact the billboard licensing office.</p>
         <p>Thank you.</p>`
      );
    } catch (err) {
      console.error('Failed to send operator rejection email:', err);
    }

    res.json(op);
  } catch (e) {
    res.status(500).json({ message: 'Failed to reject operator' });
  }
}
