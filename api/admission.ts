// api/admission.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const formData = req.body;

  if (!formData.email || !formData.studentName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const fromEmail = process.env.SMTP_FROM || 'Ashish Vidhyalay <noreply@ashishvidhyalay.com>';
  const adminEmail = process.env.ADMIN_EMAIL || 'admission@ashishvidhyalay.com';

  try {
    await Promise.all([
      transporter.sendMail({
        from: fromEmail,
        to: formData.email,
        subject: 'Admission Application Received - Ashish Vidhyalay',
        html: `<p>નમસ્તે ${formData.studentName}, તમારી અરજી મળી.</p>`,
      }),
      transporter.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject: `New Admission: ${formData.studentName} (${formData.grade})`,
        html: `<p>Name: ${formData.studentName}, Grade: ${formData.grade}, Email: ${formData.email}</p>`,
      }),
    ]);

    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
}